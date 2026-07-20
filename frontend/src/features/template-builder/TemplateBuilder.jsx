import { useState, useEffect } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import useAppStore from "../../store/useAppStore";
import { useBuilderState } from "./hooks/useBuilderState";
import ToolboxSidebar from "./components/ToolboxSidebar";
import PropertiesPanel from "./components/PropertiesPanel";
import CanvasArea from "./components/CanvasArea";
import {
  HeaderBlockPreview,
  QuestionBlockPreview,
  IdGridPreview,
} from "./components/PreviewBlocks";

export default function TemplateBuilder({ onSave }) {
  const builderState = useBuilderState();
  const { elements, setElements, saveToHistory, setConflicts, zoom } =
    builderState;

  const [activeDragId, setActiveDragId] = useState(null);
  const draftTemplate = useAppStore((state) => state.draftTemplate);

  useEffect(() => {
    if (draftTemplate?.layout_data?.elements?.length > 0) {
      setElements(draftTemplate.layout_data.elements);
      saveToHistory(draftTemplate.layout_data.elements); // ensures undo/redo works
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const checkCollisions = (currentElements) => {
    const newConflicts = [];
    const rects = {};

    currentElements.forEach((el) => {
      const domNode = document.getElementById(el.id);
      if (domNode) rects[el.id] = domNode.getBoundingClientRect();
    });

    for (let i = 0; i < currentElements.length; i++) {
      for (let j = i + 1; j < currentElements.length; j++) {
        const id1 = currentElements[i].id;
        const id2 = currentElements[j].id;
        const r1 = rects[id1];
        const r2 = rects[id2];

        if (r1 && r2) {
          const isOverlapping = !(
            r1.right < r2.left ||
            r1.left > r2.right ||
            r1.bottom < r2.top ||
            r1.top > r2.bottom
          );
          if (isOverlapping) {
            if (!newConflicts.includes(id1)) newConflicts.push(id1);
            if (!newConflicts.includes(id2)) newConflicts.push(id2);
          }
        }
      }
    }
    setConflicts(newConflicts);
  };

  useEffect(() => {
    checkCollisions(elements);
  }, [elements]);

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveDragId(null);
    const { active, delta } = event;
    if (active) {
      const actualZoom = zoom * 0.9;

      const updatedElements = elements.map((el) => {
        if (el.id === active.id) {
          return {
            ...el,

            x: Math.round(el.x + delta.x / actualZoom),
            y: Math.round(el.y + delta.y / actualZoom),
          };
        }
        return el;
      });
      setElements(updatedElements);
      saveToHistory(updatedElements);
      checkCollisions(updatedElements);
    }
  };

  const activeElement = elements.find((el) => el.id === activeDragId);
  const selectedElement = elements.find(
    (e) => e.id === builderState.selectedId,
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <div className="flex h-[850px] gap-6 bg-gray-50 p-6">
        <ToolboxSidebar {...builderState} onSave={onSave} />
        <CanvasArea {...builderState} />
        <PropertiesPanel
          selectedElement={selectedElement}
          updateElement={builderState.updateElement}
          removeElement={builderState.removeElement}
          isPreviewMode={builderState.isPreviewMode}
        />
      </div>

      <DragOverlay dropAnimation={null}>
        {activeElement ? (
          <div
            style={{
              transform: `scale(${zoom * 0.9})`,
              transformOrigin: "top left",
              opacity: 0.5,
            }}
            className="flex flex-col bg-transparent"
          >
            <div className="p-1">
              {activeElement.type === "header_block" && (
                <HeaderBlockPreview {...activeElement} />
              )}
              {activeElement.type === "text_field" && (
                <div
                  style={{
                    fontSize: `${activeElement.fontSize}px`,
                    fontWeight: activeElement.fontWeight,
                    whiteSpace: "pre-wrap",
                    color: "#000",
                  }}
                >
                  {activeElement.text}
                </div>
              )}
              {activeElement.type === "question_block" && (
                <QuestionBlockPreview {...activeElement} />
              )}
              {activeElement.type === "id_grid" && (
                <IdGridPreview digits={activeElement.digits} />
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
