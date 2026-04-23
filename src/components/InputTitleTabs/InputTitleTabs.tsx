import "./InputTitleTabs.scss"
export const addStudentsTabs = ["Personal Details", "Family / Contact", "Documents", "Previous School", "Other Info", "Custom Field"]
export const addStaffsTabs = ["Basic Info", "Payroll Details", "Bank Info Details", "Social Links Details", "Document Info", "Custom Field"]

const InputTitleTabs = ({ tabsTitles, onSetSelectedInputTitleTab, selected }: { tabsTitles: string[], onSetSelectedInputTitleTab: (title: string) => void, selected: string }) => {
    return (
        <div className="input_title_tabs" >
            {
                tabsTitles.map((item, i) => {
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
