import { FormFieldProps } from "../../types/auth";
import { FieldValues, Path } from "react-hook-form";

function InputField<T extends FieldValues>({
  type,
  placeholder,
  name,
  register,
  error,
  valueAsNumber,
}: FormFieldProps<T>) {
  return (
    <div className="w-full">
      <input
        className={`text-black w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 ${
          error
            ? "border-red-300 bg-red-50 focus:ring-red-500"
            : "border-gray-300 bg-white hover:border-gray-400"
        }`}
        type={type}
        placeholder={placeholder}
        {...register(name as Path<T>, { valueAsNumber })}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
    </div>
  );
}

export default InputField;
