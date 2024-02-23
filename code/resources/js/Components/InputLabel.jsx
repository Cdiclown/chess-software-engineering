export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label {...props}>
            {value ? value : children}
        </label>
    );
}
