import { PrimaryButton } from "../../components/Buttons/Buttons";

const widgets = [
  {
    title: "Students",
    total_count: 170,
    notification: "41",
    info_count: 2,
    info_message: "pending fee payments",
    icon: "/widget/student.png"
  },
  {
    title: "Teachers",
    total_count: 30,
    notification: "4 new this month",
    info_count: 2,
    info_message: "pending fee payments",
    icon: "/widget/teachers.png"
  },
  {
    title: "Parents",
    total_count: 148,
    notification: "25",
    info_count: 2,
    info_message: "pending fee payments",
    icon: "/widget/parents.png"
  },
  {
    title: "Staffs",
    total_count: 40,
    notification: "5",
    info_count: 2,
    info_message: "pending fee payments",
    icon: "/widget/staffs.png"
  }
]

const Dashboard = () => {
  return (
    <div className="page_wrapper">
      <div className="dashboard" >
        <div>
          <p>Welcome</p>
          <h2>EC YES - Super Admin</h2>
        </div>

        <div className="widgets">
          {
            widgets.map((item, i) => <div key={i} className="widget">
              <div className="widget_head" >
                <div className="icon" >
                  <img src={item.icon} alt="student" />
                  <p>{item.title}</p>
                </div>
                <div className="add_icon" >
                  <img src="/widget/widget_plus.svg" alt="" />
                </div>
              </div>

              <div className="widget_body">
                <p className="total_count" >173</p>
                <div className="notification" >
                  <img src="/widget/widget_notify.svg" alt="" />
                  <p>{item.notification}</p>
                </div>
              </div>

              <div className="widget_footer">
                <div className="status_message" >
                  <div className="status_point"></div>
                  <p>{item.info_count} <span>{item.info_message}</span></p>
                </div>
                <PrimaryButton title={"View All"} />
              </div>
            </div>)
          }
        </div>
      </div>
    </div>
  )
}

export default Dashboard;