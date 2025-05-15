function InputField({ label, type, value, onChange, disabled, placeholder }) {
    return (
        <div className="mb-4">
            <label className="block text-sm mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded-md"
                disabled={disabled}
                placeholder={placeholder}
            />
        </div>
    );
}

export default InputField;