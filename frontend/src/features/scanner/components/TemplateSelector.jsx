import Select from "../../../components/common/Select";
import FormField from "../../../components/common/FormField";

export default function TemplateSelector({
  templates,
  selectedTemplateId,
  setSelectedTemplateId,
}) {
  return (
    <div className="mb-5">
      <FormField label="Select Exam to Grade">
        <Select
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          className="w-full md:w-72"
        >
          <option value="" disabled>
            -- Choose an Exam --
          </option>

          {templates.map((template) => (
            <option
              key={template.id}
              value={template.id}
              disabled={
                !template.answer_key || template.answer_key.length === 0
              }
            >
              {template.name}
              {!template.answer_key || template.answer_key.length === 0
                ? " (No Answer Key)"
                : ` (${template.num_items} items)`}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
