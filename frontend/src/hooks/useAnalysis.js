import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { mergeResults } from '../utils/mergeResults';
import useAnalysisStore from '../store/analysisStore';
import { analyzeCode } from '../engine/staticAnalyzer';

function notify(message, tone = 'info') {
  window.dispatchEvent(new CustomEvent('prsense-toast', {
    detail: { message, tone },
  }));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isGitHubPullRequestUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace(/^www\./, '');
    return host === 'github.com' && /\/pull\/\d+(?:\/)?$/.test(parsed.pathname);
  } catch (error) {
    return false;
  }
}

function startStageLoop(setPhase, stages, interval = 700) {
  let active = true;
  let index = 0;
  let timerId = null;

  const tick = () => {
    if (!active) {
      return;
    }

    setPhase(stages[index]);
    index = Math.min(index + 1, stages.length - 1);
    if (active) {
      timerId = window.setTimeout(tick, interval);
    }
  };

  tick();

  return () => {
    active = false;
    if (timerId) {
      window.clearTimeout(timerId);
    }
  };
}

export default function useAnalysis() {
  const navigate = useNavigate();
  const code = useAnalysisStore((state) => state.code);
  const prUrl = useAnalysisStore((state) => state.prUrl);
  const language = useAnalysisStore((state) => state.language);
  const analysisMode = useAnalysisStore((state) => state.analysisMode);
  const setStaticResult = useAnalysisStore((state) => state.setStaticResult);
  const setAiResult = useAnalysisStore((state) => state.setAiResult);
  const setMergedResult = useAnalysisStore((state) => state.setMergedResult);
  const setPhase = useAnalysisStore((state) => state.setPhase);
  const setError = useAnalysisStore((state) => state.setError);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    let stopLoop = null;
    try {
      const targetPrUrl = prUrl.trim();

      if (isGitHubPullRequestUrl(targetPrUrl)) {
        stopLoop = startStageLoop(setPhase, ['fetching', 'extracting', 'static', 'ai', 'merging']);
        const response = await api.post('/api/analyze-pr', { prUrl: targetPrUrl, analysisMode });

        const payload = response.data || {};
        setStaticResult(payload.staticResult || null);
        setAiResult(payload.aiResult || null);
        setMergedResult(payload.mergedResult || payload);
        setPhase('done');
        navigate('/results');
        return;
      }

      if (targetPrUrl) {
        notify('Enter a valid public GitHub Pull Request URL.', 'warning');
        return;
      }

      if (!code || !code.trim()) {
        notify('Paste code or add a GitHub Pull Request URL before analyzing.', 'warning');
        return;
      }

      setPhase('static');
      const apiPromise = api.post('/api/analyze-code', { code, language, analysisMode });
      const staticResult = analyzeCode(code, language);
      setStaticResult(staticResult);
      setPhase('ai');

      const aiResponse = await apiPromise;
      const aiResult = aiResponse.data;
      setAiResult(aiResult);
      setPhase('merging');
      await delay(300);
      const merged = mergeResults(staticResult, aiResult);
      setMergedResult(merged);
      setPhase('done');
      navigate('/results');
    } catch (error) {
      if (isGitHubPullRequestUrl(prUrl.trim())) {
        setError(error.response?.data?.error || 'Pull request analysis failed.');
        setPhase('error');
        notify(error.response?.data?.error || 'Pull request analysis failed', 'error');
        return;
      }

      const staticResult = analyzeCode(code, language);
      const merged = mergeResults(staticResult, null);
      setStaticResult(staticResult);
      setAiResult(null);
      setMergedResult(merged);
      setError('AI analysis failed. Showing static analysis only.');
      setPhase('error');
      notify('AI analysis failed - showing static analysis only', 'warning');
      navigate('/results');
    } finally {
      if (stopLoop) {
        stopLoop();
      }
      setIsAnalyzing(false);
    }
  }, [analysisMode, code, language, navigate, prUrl, setAiResult, setError, setMergedResult, setPhase, setStaticResult]);

  return {
    analyze,
    isAnalyzing,
  };
}
