import "./buttons.scss"
import { useRef } from "react"

function useButton() {
    const ref = useRef<HTMLButtonElement>(null)

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
        const btn = ref.current
        if (!btn) return
        const layer = btn.querySelector(".ripple-layer") as HTMLElement
        if (!layer) return
        const rect = btn.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height) * 1.8
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2
        const ripple = document.createElement("span")
        ripple.className = "ripple"
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`
        layer.appendChild(ripple)
        ripple.addEventListener("animationend", () => ripple.remove())
    }

    const onClickCapture = () => {
        const btn = ref.current
        if (!btn) return
        btn.classList.remove("bounce")
        void btn.offsetWidth
        btn.classList.add("bounce")
        btn.addEventListener("animationend", () => btn.classList.remove("bounce"), { once: true })
    }

    return { ref, onPointerDown, onClickCapture }
}

export const AddButton = ({ title, onClick }: { title: string; onClick?: any }) => {
    const { ref, onPointerDown, onClickCapture } = useButton()
    return (
        <button ref={ref} className="button add_button" onClick={onClick}
            onPointerDown={onPointerDown} onClickCapture={onClickCapture}>
            <div className="ripple-layer" />
            <p>{title}</p>
            <img src="/svgs/plus.svg" alt="" />
        </button>
    )
}

export const GlobalButton = ({ title, onClick, icon, bg, border, color }: {
    title: string; onClick?: any; icon: string; bg?: string; border?: string; color?: string
}) => {
    const { ref, onPointerDown, onClickCapture } = useButton()
    return (
        <button ref={ref} className="button add_button"
            style={{ backgroundColor: bg, border, color }}
            onClick={onClick} onPointerDown={onPointerDown} onClickCapture={onClickCapture}>
            <div className="ripple-layer" />
            <p>{title}</p>
            <img src={icon} alt="" />
        </button>
    )
}

export const PrimaryButton = ({ title, type, onClick, disabled, isLoading }: {
    title: string; type?: "button" | "submit" | "reset"; onClick?: any; disabled?: boolean, isLoading?: boolean
}) => {
    const { ref, onPointerDown, onClickCapture } = useButton();
    return (
        <button ref={ref} className="button primary_button"
            onClick={onClick} type={type} disabled={disabled}
            onPointerDown={onPointerDown} onClickCapture={onClickCapture}>
            <div className="ripple-layer" />
            {isLoading ? <div className="loader" ></div> : title}
        </button>
    )
}

export const SecondaryButton = ({ title, onClick, disable }: { title?: string; onClick?: () => void; disable?: boolean; }) => {
    const { ref, onPointerDown, onClickCapture } = useButton()
    return (
        <button ref={ref} disabled={disable} className="button secondary_button"
            onClick={onClick} onPointerDown={onPointerDown} onClickCapture={onClickCapture}>
            <div className="ripple-layer" />
            {title || "Reset"}
        </button>
    )
}

// import "./buttons.scss"

// export const AddButton = ({ title, onClick }: { title: string; onClick?: any; }) => {
//     return (
//         <button className="button add_button" onClick={onClick} >
//             <p>{title}</p>
//             <img src="/svgs/plus.svg" alt="" />
//         </button>
//     )
// }

// export const GlobalButton = ({ title, onClick, icon, bg, border, color }: { title: string; onClick?: any; icon: string; bg?: string; border?: string; color?: string; }) => {
//     return (
//         <button className="button add_button" style={{ backgroundColor: bg, border: border, color: color }} onClick={onClick} >
//             <p>{title}</p>
//             <img src={icon} alt="" />
//         </button>
//     )
// }

// export const PrimaryButton = ({ title, type, onClick, disabled }: { title: string; type?: "button" | "submit" | "reset"; onClick?: any; disabled?: boolean }) => {
//     return (
//         <button className="button primary_button" onClick={onClick} type={type} disabled={disabled} >
//             {title}
//         </button>
//     )
// }

// export const SecondaryButton = ({ title, onClick }: { title?: string; onClick?: () => void }) => {
//     return (
//         <button className="button secondary_button" onClick={onClick}>
//             {title || "Reset"}
//         </button>
//     )
// }