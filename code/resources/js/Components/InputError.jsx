export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p {...props} className={'text-sm text-red-600 ' + className} style={{color: 'red',textAlign: 'center'}}>
            {message}
        </p>
    ) : null;
}
