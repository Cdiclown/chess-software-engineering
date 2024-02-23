export default function TestForm({children, title})
{
    const divStyle = {
        border: '5px solid pink',
        padding: '10px',
        margin: '10px',
        backgroundColor: 'lightblue',
    };

    return (
        <div style={divStyle}>
            <h1>{title}</h1>
            {children}
        </div>
    )
}
