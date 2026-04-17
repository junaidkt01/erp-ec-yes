import "./InputTitleTabs.scss"
export const inputTitleTabs = ["Personal Details", "Family / Contact", "Documents", "Previous School", "Other Info", "Custom Data"]

const InputTitleTabs = ({ onSetSelectedInputTitleTab, selected }: { onSetSelectedInputTitleTab: (title: string) => void, selected: string }) => {
    return (
        <div className="input_title_tabs" >

            {
                inputTitleTabs.map((item, i) => {
                    return (
                        <div key={i} onClick={() => onSetSelectedInputTitleTab(item)} className={`input_title_tab ${item === selected ? "opened" : ""}`}>
                            <p className="number" >{i + 1}</p>
                            <p className="title" >{item}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default InputTitleTabs;
