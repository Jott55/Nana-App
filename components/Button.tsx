class linterfriendly {
    // default
    static className = "rounded p-2 mt-4"
}

const className = {    
    blue: "bg-blue-800 border-blue-400 border-2 active:bg-blue-400 hover:bg-blue-700",
    green: "bg-green-800 border-green-400 border-2 active:bg-green-400 hover:bg-green-700",
    red: "bg-red-800 border-red-400 border-2 active:bg-red-400 hover:bg-red-700",
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    color?: keyof typeof className
}

export default async function Button({ color = 'blue', ...props }: ButtonProps)  {
    const buttonClass = `${linterfriendly.className} ${className[color]}`;
        
    return (<button className={buttonClass} {...props} >{props.children}</button>)
}