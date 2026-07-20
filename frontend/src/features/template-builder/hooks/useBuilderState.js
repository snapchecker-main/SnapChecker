import { useState, useCallback, useEffect } from "react";

const PAPER_SIZES = {
  A4: { width: 595, height: 842 },
  LETTER: { width: 612, height: 792 },
  LEGAL: { width: 612, height: 1008 },
};

export const useBuilderState = () => {
  const [paperType, setPaperType] = useState("A4");
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  const [zoom, setZoom] = useState(1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [history, setHistory] = useState([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveToHistory = useCallback(
    (newElements) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newElements);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex],
  );

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const addElement = (type) => {
    const newId = `elem_${Date.now()}`;
    const newElement = { id: newId, type, x: 50, y: 100 };

    if (type === "header_block") {
      Object.assign(newElement, {
        f1: "Name",
        f2: "Date",
        f3: "Section",
        f4: "Score",
        l1: 212,
        l2: 70,
        l3: 202,
        l4: 64,
      });
    } else if (type === "question_block") {
      const questionBlocks = elements.filter(
        (el) => el.type === "question_block",
      );
      let nextStartQ = 1;

      if (questionBlocks.length > 0) {
        const maxEndQ = Math.max(...questionBlocks.map((b) => b.end_q));
        nextStartQ = maxEndQ + 1;
      }

      Object.assign(newElement, {
        start_q: nextStartQ,
        end_q: nextStartQ + 19,
        choices: 4,
        columns: 2,
        colGap: 24,
      });
    } else if (type === "id_grid") {
      Object.assign(newElement, { digits: 6 });
    } else if (type === "text_field") {
      Object.assign(newElement, {
        text: "Text",
        fontSize: 12,
        fontWeight: "normal",
      });
    }

    const updatedElements = [...elements, newElement];
    setElements(updatedElements);
    saveToHistory(updatedElements);
    setSelectedId(newId);
  };

  const updateElement = (id, updates) => {
    const updatedElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el,
    );
    setElements(updatedElements);
    saveToHistory(updatedElements);
  };

  const removeElement = (id) => {
    const updatedElements = elements.filter((el) => el.id !== id);
    setElements(updatedElements);
    saveToHistory(updatedElements);
    setSelectedId(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Backspace" || e.key === "Delete") && selectedId) {
        const activeTag = document.activeElement.tagName;
        if (
          activeTag !== "INPUT" &&
          activeTag !== "TEXTAREA" &&
          activeTag !== "SELECT"
        ) {
          removeElement(selectedId);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, removeElement, undo, elements]); // Added 'elements' to dependency array for safety

  return {
    paperType,
    setPaperType,
    layout: PAPER_SIZES[paperType],
    elements,
    setElements,
    selectedId,
    setSelectedId,
    conflicts,
    setConflicts,
    zoom,
    setZoom,
    isPreviewMode,
    setIsPreviewMode,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    addElement,
    updateElement,
    removeElement,
    saveToHistory,
  };
};
