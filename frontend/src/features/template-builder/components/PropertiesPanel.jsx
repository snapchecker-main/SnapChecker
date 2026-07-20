import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";

export default function PropertiesPanel({
  selectedElement,
  updateElement,
  removeElement,
  isPreviewMode,
}) {
  if (isPreviewMode) return null;

  const handleNumberChange = (field, value) => {
    const parsed = value === "" ? "" : Number(value);
    updateElement(selectedElement.id, { [field]: parsed });
  };

  return (
    <Card className="flex w-72 flex-col gap-4 p-4 overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-900">Properties</h3>
      {!selectedElement ? (
        <p className="text-xs text-gray-500">Select an element to edit.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {selectedElement.type === "header_block" && (
            <>
              {/* Existing Field/Line Inputs... */}
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium">
                  Field 1{" "}
                  <Input
                    value={selectedElement.f1}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { f1: e.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-medium">
                  Line 1 px{" "}
                  <Input
                    type="number"
                    min="10"
                    value={selectedElement.l1 === "" ? "" : selectedElement.l1}
                    onChange={(e) => handleNumberChange("l1", e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium">
                  Field 2{" "}
                  <Input
                    value={selectedElement.f2}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { f2: e.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-medium">
                  Line 2 px{" "}
                  <Input
                    type="number"
                    min="10"
                    value={selectedElement.l2 === "" ? "" : selectedElement.l2}
                    onChange={(e) => handleNumberChange("l2", e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium">
                  Field 3{" "}
                  <Input
                    value={selectedElement.f3}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { f3: e.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-medium">
                  Line 3 px{" "}
                  <Input
                    type="number"
                    min="10"
                    value={selectedElement.l3 === "" ? "" : selectedElement.l3}
                    onChange={(e) => handleNumberChange("l3", e.target.value)}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium">
                  Field 4{" "}
                  <Input
                    value={selectedElement.f4}
                    onChange={(e) =>
                      updateElement(selectedElement.id, { f4: e.target.value })
                    }
                  />
                </label>
                <label className="text-xs font-medium">
                  Line 4 px{" "}
                  <Input
                    type="number"
                    min="10"
                    value={selectedElement.l4 === "" ? "" : selectedElement.l4}
                    onChange={(e) => handleNumberChange("l4", e.target.value)}
                  />
                </label>
              </div>

              {/* THE FIX: Font properties added to the Header Block */}
              <div className="border-t border-gray-100 pt-3 mt-1">
                <label className="text-xs font-medium">
                  Font Family{" "}
                  <Select
                    value={selectedElement.fontFamily || "sans-serif"}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        fontFamily: e.target.value,
                      })
                    }
                  >
                    <option value="sans-serif">Sans Serif (Clean)</option>
                    <option value="serif">Serif (Formal)</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', Times, serif">
                      Times New Roman
                    </option>
                    <option value="'Courier New', Courier, monospace">
                      Courier New
                    </option>
                  </Select>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="text-xs font-medium">
                    Font Size{" "}
                    <Select
                      value={selectedElement.fontSize || 12}
                      onChange={(e) =>
                        handleNumberChange("fontSize", e.target.value)
                      }
                    >
                      <option value="12">12px</option>
                      <option value="14">14px</option>
                      <option value="16">16px</option>
                    </Select>
                  </label>
                  <label className="text-xs font-medium">
                    Weight{" "}
                    <Select
                      value={selectedElement.fontWeight || "600"}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          fontWeight: e.target.value,
                        })
                      }
                    >
                      <option value="normal">Normal</option>
                      <option value="600">Bold</option>
                    </Select>
                  </label>
                </div>
              </div>
            </>
          )}

          {selectedElement.type === "text_field" && (
            <>
              <label className="text-xs font-medium">
                Text Content{" "}
                <Input
                  value={selectedElement.text}
                  onChange={(e) =>
                    updateElement(selectedElement.id, { text: e.target.value })
                  }
                />
              </label>
              <label className="text-xs font-medium">
                Font Family{" "}
                <Select
                  value={selectedElement.fontFamily || "sans-serif"}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      fontFamily: e.target.value,
                    })
                  }
                >
                  <option value="sans-serif">Sans Serif (Clean)</option>
                  <option value="serif">Serif (Formal)</option>
                  <option value="monospace">Monospace (Code)</option>
                </Select>
              </label>
              <label className="text-xs font-medium">
                Font Size{" "}
                <Select
                  value={selectedElement.fontSize}
                  onChange={(e) =>
                    handleNumberChange("fontSize", e.target.value)
                  }
                >
                  <option value="12">Small (12px)</option>
                  <option value="16">Medium (16px)</option>
                  <option value="20">Large (20px)</option>
                  <option value="24">Title (24px)</option>
                </Select>
              </label>
              <label className="text-xs font-medium">
                Weight{" "}
                <Select
                  value={selectedElement.fontWeight}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      fontWeight: e.target.value,
                    })
                  }
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </Select>
              </label>
            </>
          )}

          {selectedElement.type === "question_block" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium">
                  Start Q{" "}
                  <Input
                    type="number"
                    min="1"
                    value={
                      selectedElement.start_q === ""
                        ? ""
                        : selectedElement.start_q
                    }
                    onChange={(e) =>
                      handleNumberChange("start_q", e.target.value)
                    }
                  />
                </label>
                <label className="text-xs font-medium">
                  End Q{" "}
                  <Input
                    type="number"
                    min="1"
                    value={
                      selectedElement.end_q === "" ? "" : selectedElement.end_q
                    }
                    onChange={(e) =>
                      handleNumberChange("end_q", e.target.value)
                    }
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-medium">
                  Choices{" "}
                  <Input
                    type="number"
                    min="2"
                    max="10"
                    value={
                      selectedElement.choices === ""
                        ? ""
                        : selectedElement.choices
                    }
                    onChange={(e) =>
                      handleNumberChange("choices", e.target.value)
                    }
                  />
                </label>
                <label className="text-xs font-medium">
                  Columns{" "}
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={
                      selectedElement.columns === ""
                        ? ""
                        : selectedElement.columns
                    }
                    onChange={(e) =>
                      handleNumberChange("columns", e.target.value)
                    }
                  />
                </label>
              </div>
              <label className="text-xs font-medium mt-2">
                Column Gap Spacing (0+){" "}
                <Input
                  type="number"
                  min="0"
                  value={
                    selectedElement.colGap === "" ? "" : selectedElement.colGap
                  }
                  onChange={(e) => handleNumberChange("colGap", e.target.value)}
                />
              </label>
            </>
          )}

          {selectedElement.type === "id_grid" && (
            <label className="text-xs font-medium">
              ID Length (Digits){" "}
              <Input
                type="number"
                min="2"
                max="15"
                value={
                  selectedElement.digits === "" ? "" : selectedElement.digits
                }
                onChange={(e) => handleNumberChange("digits", e.target.value)}
              />
            </label>
          )}

          <button
            className="mt-4 text-xs font-medium text-red-600 hover:underline text-left w-fit"
            onClick={() => removeElement(selectedElement.id)}
          >
            Remove Block (or press Delete)
          </button>
        </div>
      )}
    </Card>
  );
}
