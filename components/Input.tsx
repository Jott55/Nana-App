interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    title?: string;
    id: string
}

/** title is the input.name.toLowerCase, and label text */
export default async function FormInput({ title, id, ...props }: InputProps) {
    return (
    <>
        <label htmlFor={id}>{title}</label>
        <input id={id} name={title?.toLowerCase()} className="border" {...props} />
    </>
    )
}