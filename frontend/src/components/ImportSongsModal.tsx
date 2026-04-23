import { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Upload, X, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface ImportSongsModalProps {
  isOpen: boolean;
  onConfirm: (songs: ParsedSong[]) => void;
  onCancel: () => void;
}

export interface ParsedSong {
  youtubeId: string;
  artist: string;
  song: string;
  language: 'pt-BR' | 'en' | 'es';
  genre: string;
  duration: string;
  lineNumber: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: { line: number; error: string }[];
}

export function ImportSongsModal({ isOpen, onConfirm, onCancel }: ImportSongsModalProps) {
  const [parsedSongs, setParsedSongs] = useState<ParsedSong[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrors(['Por favor, selecione um arquivo CSV válido']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.onerror = () => {
      setErrors(['Erro ao ler o arquivo']);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      setErrors(['Arquivo CSV vazio']);
      return;
    }

    const header = lines[0].toLowerCase().trim();
    const expectedHeader = 'youtubeid,artist,song,language,genre,duration';

    if (header !== expectedHeader) {
      setErrors([
        'Cabeçalho inválido no CSV',
        `Esperado: ${expectedHeader}`,
        `Encontrado: ${header}`,
      ]);
      return;
    }

    const songs: ParsedSong[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());

      if (parts.length !== 6) {
        parseErrors.push(`Linha ${i + 1}: Número incorreto de colunas (esperado 6, encontrado ${parts.length})`);
        continue;
      }

      const [youtubeId, artist, song, language, genre, duration] = parts;

      // Validações
      const lineErrors: string[] = [];

      if (!/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
        lineErrors.push('ID do YouTube inválido (deve ter 11 caracteres)');
      }

      if (!artist) lineErrors.push('Artista é obrigatório');
      if (!song) lineErrors.push('Música é obrigatória');
      if (!genre) lineErrors.push('Gênero é obrigatório');

      if (!['pt-BR', 'en', 'es'].includes(language)) {
        lineErrors.push('Idioma inválido (use pt-BR, en ou es)');
      }

      if (!/^\d{1,2}:\d{2}$/.test(duration)) {
        lineErrors.push('Duração inválida (use formato MM:SS)');
      }

      if (lineErrors.length > 0) {
        parseErrors.push(`Linha ${i + 1}: ${lineErrors.join(', ')}`);
        continue;
      }

      songs.push({
        youtubeId,
        artist,
        song,
        language: language as 'pt-BR' | 'en' | 'es',
        genre,
        duration,
        lineNumber: i + 1,
      });
    }

    if (parseErrors.length > 0) {
      setErrors(parseErrors);
      setParsedSongs([]);
    } else if (songs.length === 0) {
      setErrors(['Nenhuma música válida encontrada no CSV']);
      setParsedSongs([]);
    } else {
      setErrors([]);
      setParsedSongs(songs);
    }
  };

  const handleImport = async () => {
    if (parsedSongs.length === 0) return;

    setIsProcessing(true);
    try {
      await onConfirm(parsedSongs);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/api/videos/csv-template', '_blank');
  };

  const handleCancel = () => {
    setParsedSongs([]);
    setErrors([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleCancel}
    >
      <div
        className={`rounded-2xl p-4 sm:p-8 max-w-4xl w-full m-4 sm:my-8 transition-all duration-300 border shadow-2xl ${
          isLight
            ? 'bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-[0_22px_60px_rgba(15,23,42,0.14)]'
            : 'bg-gradient-to-br from-[rgba(0,39,118,0.85)] to-[rgba(0,155,58,0.85)] border-white/10'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isLight ? 'bg-blue-100' : 'bg-white/10'}`}>
              <Upload className={`w-6 h-6 ${isLight ? 'text-blue-600' : 'text-blue-300'}`} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Importar Músicas em Lote
              </h2>
              <p className={`${isLight ? 'text-slate-600' : 'text-blue-50/90'} text-sm mt-1`}>
                Faça upload de um arquivo CSV para adicionar várias músicas de uma vez
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className={`p-2 rounded-lg transition-colors ${
              isLight
                ? 'hover:bg-slate-100 text-slate-600'
                : 'hover:bg-white/10 text-white/80'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Download Template Button */}
        <div
          className={`rounded-lg p-4 mb-6 border ${
            isLight
              ? 'bg-blue-50 border-blue-200'
              : 'bg-blue-900/20 border-blue-500/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <FileText className={`w-5 h-5 mt-0.5 ${isLight ? 'text-blue-600' : 'text-blue-300'}`} />
            <div className="flex-1">
              <p className={`${isLight ? 'text-blue-900' : 'text-white'} font-medium mb-1`}>
                Formato do arquivo CSV
              </p>
              <p className={`${isLight ? 'text-blue-700' : 'text-blue-100'} text-sm mb-3`}>
                O arquivo deve conter as colunas: <code className="font-mono">youtubeId,artist,song,language,genre,duration</code>
              </p>
              <button
                onClick={handleDownloadTemplate}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isLight
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                Baixar Template CSV
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mb-6">
          <label
            className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isLight
                ? 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
                : 'border-white/20 hover:border-white/30 bg-white/5 hover:bg-white/10'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className={`w-12 h-12 mx-auto mb-3 ${isLight ? 'text-slate-400' : 'text-white/60'}`} />
            <p className={`${isLight ? 'text-slate-700' : 'text-white'} font-medium mb-1`}>
              Clique para selecionar o arquivo CSV
            </p>
            <p className={`${isLight ? 'text-slate-500' : 'text-white/60'} text-sm`}>
              ou arraste e solte aqui
            </p>
          </label>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div
            className={`rounded-lg p-4 mb-6 border ${
              isLight
                ? 'bg-red-50 border-red-200'
                : 'bg-red-900/20 border-red-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 ${isLight ? 'text-red-600' : 'text-red-300'}`} />
              <div className="flex-1">
                <p className={`${isLight ? 'text-red-900' : 'text-red-100'} font-medium mb-2`}>
                  Erros encontrados no arquivo:
                </p>
                <ul className={`${isLight ? 'text-red-700' : 'text-red-200'} text-sm space-y-1 list-disc list-inside`}>
                  {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Preview of Parsed Songs */}
        {parsedSongs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Músicas encontradas: {parsedSongs.length}
              </h3>
            </div>
            <div
              className={`rounded-lg border overflow-hidden ${
                isLight
                  ? 'bg-white border-slate-200'
                  : 'bg-black/30 border-white/10'
              }`}
            >
              <div className="max-h-64 overflow-y-auto overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`sticky top-0 ${isLight ? 'bg-slate-100' : 'bg-white/10'}`}>
                    <tr className={`${isLight ? 'text-slate-700' : 'text-white/90'}`}>
                      <th className="text-left px-3 py-2 font-medium">#</th>
                      <th className="text-left px-3 py-2 font-medium">Artista</th>
                      <th className="text-left px-3 py-2 font-medium">Música</th>
                      <th className="text-left px-3 py-2 font-medium">Idioma</th>
                      <th className="text-left px-3 py-2 font-medium">Gênero</th>
                      <th className="text-left px-3 py-2 font-medium">Duração</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedSongs.map((song, idx) => (
                      <tr
                        key={idx}
                        className={`border-t ${
                          isLight
                            ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                            : 'border-white/10 text-white/90 hover:bg-white/5'
                        }`}
                      >
                        <td className="px-3 py-2">{idx + 1}</td>
                        <td className="px-3 py-2">{song.artist}</td>
                        <td className="px-3 py-2">{song.song}</td>
                        <td className="px-3 py-2">
                          {song.language === 'pt-BR' ? '🇧🇷' : song.language === 'en' ? '🇺🇸' : '🇪🇸'}{' '}
                          {song.language}
                        </td>
                        <td className="px-3 py-2">{song.genre}</td>
                        <td className="px-3 py-2 font-mono">{song.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Import Result */}
        {importResult && (
          <div
            className={`rounded-lg p-4 mb-6 border ${
              isLight
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-emerald-900/20 border-emerald-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 mt-0.5 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />
              <div className="flex-1">
                <p className={`${isLight ? 'text-emerald-900' : 'text-emerald-100'} font-medium mb-2`}>
                  Importação concluída!
                </p>
                <p className={`${isLight ? 'text-emerald-700' : 'text-emerald-200'} text-sm`}>
                  ✅ {importResult.success} músicas adicionadas com sucesso
                  {importResult.failed > 0 && ` • ❌ ${importResult.failed} falharam`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={handleCancel}
            className={`flex-1 px-4 py-3 rounded-lg transition-colors border font-medium ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            {parsedSongs.length > 0 ? 'Cancelar' : 'Fechar'}
          </button>
          {parsedSongs.length > 0 && (
            <button
              onClick={handleImport}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)] hover:brightness-110 text-white font-semibold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isLight ? 'shadow-emerald-300/40' : 'shadow-emerald-900/30'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Importar {parsedSongs.length} Música{parsedSongs.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
