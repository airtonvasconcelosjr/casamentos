function InputField({ label, type, value, onChange, disabled }) {
    return (
        <div className="mb-4">
            <label className="block text-sm mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full p-2 border rounded-md"
                disabled={disabled}
            />
        </div>
    );
}

export default InputField;