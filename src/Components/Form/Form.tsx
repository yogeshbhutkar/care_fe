import { isEmpty, omitBy } from "lodash";
import { useEffect, useReducer, useState } from "react";
import { classNames } from "../../Utils/utils";
import { Cancel, Submit } from "../Common/components/ButtonV2";
import { FieldValidator } from "./FieldValidators";
import { FormContext, FormContextValue } from "./FormContext";
import { FieldChangeEvent } from "./FormFields/Utils";
import { FormDetails, FormErrors, formReducer, FormReducer } from "./Utils";

type Props<T extends FormDetails> = {
  context: FormContext<T>;
  className?: string;
  defaults: T;
  asyncGetDefaults?: (() => Promise<T>) | false;
  onlyChild?: boolean;
  validate?: (form: T) => FormErrors<T>;
  onSubmit: (form: T) => Promise<FormErrors<T> | void>;
  onCancel?: () => void;
  noPadding?: true;
  disabled?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: (props: FormContextValue<T>) => React.ReactNode;
};

const Form = <T extends FormDetails>({
  asyncGetDefaults,
  validate,
  ...props
}: Props<T>) => {
  const initial = { form: props.defaults, errors: {} };
  const [isLoading, setIsLoading] = useState(!!asyncGetDefaults);
  const [state, dispatch] = useReducer<FormReducer<T>>(formReducer, initial);

  useEffect(() => {
    if (!asyncGetDefaults) return;

    asyncGetDefaults().then((form) => {
      dispatch({ type: "set_form", form });
      setIsLoading(false);
    });
  }, [asyncGetDefaults]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (validate) {
      const errors = omitBy(validate(state.form), isEmpty) as FormErrors<T>;

      if (Object.keys(errors).length) {
        dispatch({ type: "set_errors", errors });
        return;
      }
    }

    const errors = await props.onSubmit(state.form);
    if (errors) {
      dispatch({
        type: "set_errors",
        errors: { ...state.errors, ...errors },
      });
    }
  };

  const { Provider, Consumer } = props.context;
  const disabled = isLoading || props.disabled;

  return (
    <form
      onSubmit={handleSubmit}
      className={classNames(
        "bg-white rounded w-full mx-auto",
        !props.noPadding && "px-8 md:px-16 py-5 md:py-11",
        props.className
      )}
      noValidate
    >
      <Provider
        value={(name: keyof T, validate?: FieldValidator<T[keyof T]>) => {
          return {
            name,
            id: name,
            onChange: ({ name, value }: FieldChangeEvent<T[keyof T]>) =>
              dispatch({
                type: "set_field",
                name,
                value,
                error: validate && validate(value),
              }),
            value: state.form[name],
            error: state.errors[name],
            disabled,
          };
        }}
      >
        {props.onlyChild ? (
          <Consumer>{props.children}</Consumer>
        ) : (
          <>
            <div className="my-6">
              <Consumer>{props.children}</Consumer>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <Cancel
                onClick={props.onCancel}
                label={props.cancelLabel ?? "Cancel"}
              />
              <Submit
                type="submit"
                disabled={disabled}
                label={props.submitLabel ?? "Submit"}
              />
            </div>
          </>
        )}
      </Provider>
    </form>
  );
};

export default Form;
