interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export async function LinkButton({...props} : LinkButtonProps) {
    return (
        <a className="rounded-xl border-blue-600 border-2 bg-blue-900 hover:bg-blue-600  px-8 py-1" {...props}>{props.children}</a>
    )
}