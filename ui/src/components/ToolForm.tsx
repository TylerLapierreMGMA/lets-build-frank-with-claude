import { useState } from "react";
import Form from "@cloudscape-design/components/form";
import FormField from "@cloudscape-design/components/form-field";
import Input from "@cloudscape-design/components/input";
import Checkbox from "@cloudscape-design/components/checkbox";
import Select from "@cloudscape-design/components/select";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";

export interface JsonSchemaProperty {
  type?: string;
  description?: string;
  enum?: string[];
}

export interface ToolInputSchema {
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

interface ToolFormProps {
  schema: ToolInputSchema;
  onSubmit: (values: Record<string, unknown>) => void;
  submitting?: boolean;
}

// Renders one field per JSON-schema property. This is what makes a new tool
// appear in the console with zero UI work, per ADR-003 — as long as its input
// schema sticks to string/number/boolean/enum.
export default function ToolForm({ schema, onSubmit, submitting }: ToolFormProps) {
  const properties = schema.properties ?? {};
  const propertyNames = Object.keys(properties);
  const [values, setValues] = useState<Record<string, string | boolean>>({});

  function setValue(name: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed: Record<string, unknown> = {};
    for (const name of propertyNames) {
      const property = properties[name];
      const raw = values[name];
      if (raw === undefined || raw === "") continue;
      parsed[name] = property.type === "number" || property.type === "integer" ? Number(raw) : raw;
    }
    onSubmit(parsed);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Form
        actions={
          <Button variant="primary" formAction="submit" loading={submitting}>
            Run
          </Button>
        }
      >
        {propertyNames.length === 0 ? (
          <div>This tool takes no parameters.</div>
        ) : (
          <SpaceBetween size="m">
            {propertyNames.map((name) => {
              const property = properties[name];
              const required = schema.required?.includes(name) ?? false;

              if (property.type === "boolean") {
                return (
                  <FormField key={name} label={name} description={property.description}>
                    <Checkbox
                      checked={Boolean(values[name])}
                      onChange={({ detail }) => setValue(name, detail.checked)}
                    >
                      {name}
                    </Checkbox>
                  </FormField>
                );
              }

              if (property.enum) {
                const options = property.enum.map((option) => ({ label: option, value: option }));
                return (
                  <FormField key={name} label={name} description={property.description}>
                    <Select
                      selectedOption={options.find((o) => o.value === values[name]) ?? null}
                      onChange={({ detail }) => setValue(name, detail.selectedOption.value ?? "")}
                      options={options}
                      placeholder={`Choose ${name}`}
                    />
                  </FormField>
                );
              }

              return (
                <FormField
                  key={name}
                  label={required ? `${name} *` : name}
                  description={property.description}
                >
                  <Input
                    value={typeof values[name] === "string" ? (values[name] as string) : ""}
                    onChange={({ detail }) => setValue(name, detail.value)}
                    type={property.type === "number" || property.type === "integer" ? "number" : "text"}
                  />
                </FormField>
              );
            })}
          </SpaceBetween>
        )}
      </Form>
    </form>
  );
}
