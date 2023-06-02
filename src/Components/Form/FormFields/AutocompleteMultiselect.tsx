import React, { useEffect, useState } from "react";
import { Combobox } from "@headlessui/react";
import { DropdownTransition } from "../../Common/components/HelperComponents";
import CareIcon from "../../../CAREUI/icons/CareIcon";
import { FormFieldBaseProps, useFormFieldPropsResolver } from "./Utils";
import FormField from "./FormField";
import {
  dropdownOptionClassNames,
  MultiSelectOptionChip,
} from "../MultiSelectMenuV2";

type OptionCallback<T, R> = (option: T) => R;

type AutocompleteMultiSelectFormFieldProps<T, V> = FormFieldBaseProps<V[]> & {
  placeholder?: string;
  options: T[];
  optionLabel: OptionCallback<T, string>;
  optionValue?: OptionCallback<T, V>;
  onQuery?: (query: string) => void;
  dropdownIcon?: React.ReactNode | undefined;
};

const AutocompleteMultiSelectFormField = <T, V>(
  props: AutocompleteMultiSelectFormFieldProps<T, V>
) => {
  const field = useFormFieldPropsResolver(props);
  return (
    <FormField field={field}>
      <AutocompleteMutliSelect
        {...props}
        {...field}
        value={field.value || []}
        onChange={field.handleChange}
      />
    </FormField>
  );
};

export default AutocompleteMultiSelectFormField;

type AutocompleteMutliSelectProps<T, V = T> = {
  id?: string;
  options: T[];
  disabled?: boolean | undefined;
  value: V[];
  placeholder?: string;
  optionLabel: OptionCallback<T, string>;
  optionValue?: OptionCallback<T, V>;
  className?: string;
  onChange: OptionCallback<V[], void>;
  onQuery?: (query: string) => void;
  isLoading?: boolean;
};

/**
 * Avoid using this component directly. Use `AutocompleteMultiSelectFormField`
 * instead as its API is easier to use and compliant with `FormField` based
 * components.
 *
 * Use this only when you want to hack into the design and get more
 * customizability.
 */
export const AutocompleteMutliSelect = <T, V>(
  props: AutocompleteMutliSelectProps<T, V>
) => {
  const [query, setQuery] = useState(""); // Ensure lower case
  useEffect(() => {
    props.onQuery && props.onQuery(query);
  }, [query]);

  const options = props.options.map((option) => {
    const label = props.optionLabel(option);
    return {
      label,
      search: label.toLowerCase(),
      value: (props.optionValue ? props.optionValue(option) : option) as V,
    };
  });

  const value = options.filter((o) => props.value.includes(o.value));
  const filteredOptions = options.filter((o) => o.search.includes(query));

  return (
    <div className={props.className} id={props.id}>
      <Combobox
        disabled={props.disabled}
        value={value}
        multiple
        onChange={(selection) => props.onChange(selection.map((o) => o.value))}
      >
        <div className="relative">
          <div className="flex">
            <Combobox.Input
              multiple
              className="cui-input-base pr-16 truncate"
              placeholder={
                value.length
                  ? `${value.length} item(s) selected`
                  : props.placeholder || "Select"
              }
              onChange={(event) => setQuery(event.target.value.toLowerCase())}
              autoComplete="off"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <div className="absolute top-1 right-0 flex items-center mr-2 text-lg text-gray-900">
                {props.isLoading ? (
                  <CareIcon className="care-l-spinner animate-spin" />
                ) : (
                  <CareIcon className="care-l-angle-down -mb-1.5" />
                )}
              </div>
            </Combobox.Button>
          </div>
          {value.length !== 0 && (
            <div className="p-2 flex flex-wrap gap-2">
              {value.map((v) => (
                <MultiSelectOptionChip
                  label={v.label}
                  onRemove={() =>
                    props.onChange(
                      value.map((o) => o.value).filter((o) => o !== v.value)
                    )
                  }
                />
              ))}
            </div>
          )}

          <DropdownTransition>
            <Combobox.Options className="cui-dropdown-base top-12 absolute z-10 mt-0.5">
              {props.isLoading ? (
                <Searching />
              ) : filteredOptions.length ? (
                filteredOptions.map((option, index) => (
                  <Combobox.Option
                    id={`${props.id}-option-${option.value}`}
                    key={index}
                    className={dropdownOptionClassNames}
                    value={option}
                  >
                    {({ selected }) => (
                      <div className="flex justify-between">
                        {option.label}
                        {selected && (
                          <CareIcon className="care-l-check text-lg" />
                        )}
                      </div>
                    )}
                  </Combobox.Option>
                ))
              ) : (
                <span className="flex items-center justify-center gap-2 py-6">
                  {!query && <CareIcon className="care-l-search text-lg" />}
                  {query ? "No results" : "Type to search"}
                </span>
              )}
            </Combobox.Options>
          </DropdownTransition>
        </div>
      </Combobox>
    </div>
  );
};

const Searching = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <CareIcon className="care-l-spinner animate-spin text-xl" />
      <span>Searching...</span>
    </div>
  );
};
