"use client";

interface NoteEditorProps {
  value: string;
  onChange: (text: string) => void;
}

export default function NoteEditor({ value, onChange }: NoteEditorProps) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <label className="text-xs font-medium text-gray-500 block mb-1">
        Your notes
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Jot down your thoughts..."
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   resize-none bg-gray-50 placeholder-gray-400"
      />
    </div>
  );
}
