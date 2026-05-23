import { lazy, Suspense, useEffect, useRef } from 'react';
import useAnalysisStore from '../../store/analysisStore';
import GlassCard from '../shared/GlassCard';
import { inferLanguageFromCode } from '../../utils/languageDetection';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  lineHeight: 22,
  smoothScrolling: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  wordWrap: 'on',
  fontFamily: 'JetBrains Mono, monospace',
  renderLineHighlight: 'all',
  cursorBlinking: 'smooth',
  roundedSelection: true,
  padding: { top: 16, bottom: 16 },
};

export default function CodeEditor() {
  const code = useAnalysisStore((state) => state.code);
  const setCode = useAnalysisStore((state) => state.setCode);
  const language = useAnalysisStore((state) => state.language);
  const languageSource = useAnalysisStore((state) => state.languageSource);
  const codeOrigin = useAnalysisStore((state) => state.codeOrigin);
  const setLanguage = useAnalysisStore((state) => state.setLanguage);
  const activeIssueLine = useAnalysisStore((state) => state.activeIssueLine);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationIdsRef = useRef([]);

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) {
      return;
    }

    if (activeIssueLine) {
      const decorations = [
        {
          range: new monaco.Range(activeIssueLine, 1, activeIssueLine, 1),
          options: {
            isWholeLine: true,
            className: 'prsense-active-line',
            linesDecorationsClassName: 'prsense-active-gutter',
          },
        },
      ];
      decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);
      editor.revealLineInCenter(activeIssueLine);
      return;
    }

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, []);
  }, [activeIssueLine]);

  return (
    <GlassCard className="h-[78vh] p-0 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-text-muted">Code Editor</h2>
          <p className="mt-1 text-sm text-text-secondary">Paste code, upload a file, or highlight issues from the results view.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-secondary">prsense-dark</div>
      </div>
      <div className="h-[calc(78vh-72px)] bg-[#090910]">
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-text-secondary">
              Loading Monaco editor...
            </div>
          }
        >
          <MonacoEditor
            language={language}
            value={code}
            theme="prsense-dark"
            beforeMount={(monaco) => {
              monaco.editor.defineTheme('prsense-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                  { token: '', foreground: 'f8fafc' },
                  { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
                  { token: 'keyword', foreground: 'c084fc' },
                  { token: 'string', foreground: '67e8f9' },
                  { token: 'number', foreground: 'f59e0b' },
                ],
                colors: {
                  'editor.background': '#090910',
                  'editor.foreground': '#f8fafc',
                  'editor.lineHighlightBackground': '#13131f',
                  'editorLineNumber.foreground': '#475569',
                  'editorLineNumber.activeForeground': '#8b5cf6',
                  'editorCursor.foreground': '#06b6d4',
                  'editor.selectionBackground': '#8b5cf633',
                  'editor.inactiveSelectionBackground': '#8b5cf61f',
                  'editorIndentGuide.background1': '#20202d',
                },
              });
              monaco.editor.setTheme('prsense-dark');
              monacoRef.current = monaco;
            }}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
              editor.updateOptions(editorOptions);
            }}
            onChange={(value) => {
              const nextCode = value || '';
              setCode(nextCode, 'user');
              if (languageSource !== 'manual') {
                const detectedLanguage = inferLanguageFromCode(nextCode);
                if (detectedLanguage) {
                  setLanguage(detectedLanguage, 'auto');
                }
              }
            }}
            options={editorOptions}
          />
        </Suspense>
        {!code ? (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-6 text-center">
            <div className="max-w-lg rounded-3xl border border-white/10 bg-base/70 px-6 py-5 text-sm text-text-secondary shadow-2xl backdrop-blur-xl">
              Select a language, then paste code or upload a file. PRSense will analyze the exact content you provide.
            </div>
          </div>
        ) : null}
      </div>
    </GlassCard>
  );
}
