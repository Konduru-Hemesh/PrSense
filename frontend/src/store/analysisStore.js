import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_SNIPPET, LANGUAGE_BOILERPLATES, LANGUAGE_OPTIONS } from '../utils/constants';

const defaultLanguage = LANGUAGE_OPTIONS[0]?.value || 'javascript';

const initialState = {
  code: DEFAULT_SNIPPET,
  prUrl: '',
  repoUrl: '',
  reviewTarget: 'code',
  language: defaultLanguage,
  languageSource: 'auto',
  analysisMode: 'deep-review',
  codeOrigin: 'starter',
  uploadedFileName: '',
  staticResult: null,
  aiResult: null,
  mergedResult: null,
  phase: 'idle',
  error: null,
  activeIssueId: null,
  activeIssueLine: null,
  activeCategory: 'all',
  activeSeverity: null,
};

const useAnalysisStore = create(
  persist(
    (set) => ({
      ...initialState,
      // new settings
      autoPostComments: true,
      commentThreshold: 0,
      setAutoPostComments: (autoPostComments) => set({ autoPostComments }),
      setCommentThreshold: (commentThreshold) => set({ commentThreshold }),
      setCode: (code, codeOrigin = 'user') => set({ code, codeOrigin }),
      setPrUrl: (prUrl) => set({ prUrl }),
      setRepoUrl: (repoUrl) => set({ repoUrl }),
      setReviewTarget: (reviewTarget) => set({ reviewTarget }),
      setLanguage: (language, languageSource = 'manual') => set((state) => ({
        language,
        languageSource,
        code: state.codeOrigin === 'starter' ? (LANGUAGE_BOILERPLATES[language] || state.code || DEFAULT_SNIPPET) : state.code,
        codeOrigin: state.codeOrigin === 'starter' ? 'starter' : state.codeOrigin,
      })),
      setAnalysisMode: (analysisMode) => set({ analysisMode }),
      setUploadedFileName: (uploadedFileName) => set({ uploadedFileName }),
      setStaticResult: (staticResult) => set({ staticResult }),
      setAiResult: (aiResult) => set({ aiResult }),
      setMergedResult: (mergedResult) => set({ mergedResult }),
      setPhase: (phase) => set({ phase }),
      setError: (error) => set({ error }),
      setActiveIssue: (issue = null) => set({
        activeIssueId: issue?.id || null,
        activeIssueLine: issue?.line || null,
        activeCategory: issue?.category || 'all',
        activeSeverity: issue?.severity || null,
      }),
      setActiveCategory: (activeCategory) => set({ activeCategory }),
      clearAll: () => set(initialState),
    }),
    {
      name: 'prsense-analysis-state',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        code: state.code,
        prUrl: state.prUrl,
        repoUrl: state.repoUrl,
        reviewTarget: state.reviewTarget,
        language: state.language,
        languageSource: state.languageSource,
        analysisMode: state.analysisMode,
        codeOrigin: state.codeOrigin,
        uploadedFileName: state.uploadedFileName,
        staticResult: state.staticResult,
        aiResult: state.aiResult,
        mergedResult: state.mergedResult,
        phase: state.phase,
        error: state.error,
        activeIssueId: state.activeIssueId,
        activeIssueLine: state.activeIssueLine,
        activeCategory: state.activeCategory,
        activeSeverity: state.activeSeverity,
      }),
    },
  ),
);

export default useAnalysisStore;
