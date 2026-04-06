import { useRef, useEffect, useCallback, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

interface EditorProps {
    doc: Y.Doc | null;
    provider: WebsocketProvider | null;
    language?: string;
}

export default function CodeEditor({ doc, provider, language = 'javascript' }: EditorProps) {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const [editorMounted, setEditorMounted] = useState(false);

    const handleEditorDidMount: OnMount = useCallback((editorInstance) => {
        editorRef.current = editorInstance;
        setEditorMounted(true);
    }, []);

    // Set up MonacoBinding when editor, doc, and provider are all ready
    useEffect(() => {
        const editorInstance = editorRef.current;
        if (!editorInstance || !doc || !provider) return;

        const yText = doc.getText('content');
        bindingRef.current = new MonacoBinding(
            yText,
            editorInstance.getModel()!,
            new Set([editorInstance]),
            provider.awareness
        );

        // Set initial content if the shared document is empty
        if (yText.length === 0) {
            const defaultCode = [
                '// Welcome to Live Code Editor!',
                '// Share the URL to collaborate in real-time.',
                '',
                'function greet(name) {',
                '  return `Hello, ${name}!`;',
                '}',
                '',
                "console.log(greet('World'));",
                '',
            ].join('\n');
            yText.insert(0, defaultCode);
        }

        return () => {
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
        };
    }, [doc, provider, editorMounted]);

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                onMount={handleEditorDidMount}
                options={{
                    fontSize: 14,
                    fontFamily: 'Fira Code, Consolas, Monaco, monospace',
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderWhitespace: 'selection',
                    tabSize: 2,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    padding: { top: 10 },
                    // Enable remote cursor rendering
                    renderLineHighlight: 'all',
                    overviewRulerBorder: false,
                }}
            />
        </div>
    );
}
