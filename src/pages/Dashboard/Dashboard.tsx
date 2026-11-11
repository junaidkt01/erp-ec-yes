import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/Buttons/Buttons";
import LoadingOverlay, { ErrorStatusOverlay } from "../../components/Loadingoverlay";
import { useDashboard } from "../../hooks/useDashboard";
import BigCalendar from "../../components/MyCalendar/BigCalendar";
import Footer from "../../components/Footer/Footer";
import { useEffect, useState } from "react";

// const widgets = [
//   {
//     title: "Students",
//     total_count: 170,
//     notification: "41",
//     info_count: 2,
//     info_message: "pending fee payments",
//     icon: "/widget/student.png"
//   },
//   {
//     title: "Teachers",
//     total_count: 30,
//     notification: "4 new this month",
//     info_count: 2,
//     info_message: "pending fee payments",
//     icon: "/widget/teachers.png"
//   },
//   {
//     title: "Parents",
//     total_count: 148,
//     notification: "25",
//     info_count: 2,
//     info_message: "pending fee payments",
//     icon: "/widget/parents.png"
//   },
//   {
//     title: "Staffs",
//     total_count: 40,
//     notification: "5",
//     info_count: 2,
//     info_message: "pending fee payments",
//     icon: "/widget/staffs.png"
//   }
// ]

const Dashboard = () => {
  const navigate = useNavigate();

  const { data, error, isLoading, isError } = useDashboard();
  console.log("data: dash", data, error, isLoading, isError)

  //////////////////////////////////////////////
  const [activeMessage, setActiveMessage] = useState(0);
  const studentsMsg = data?.card_stats?.students?.messages || [];
  const parentsMsg = data?.card_stats?.parents?.messages || [];
  const teachersMsg = data?.card_stats?.teachers?.messages || [];
  const staffsMsg = data?.card_stats?.staffs?.messages || [];

  useEffect(() => {
    if (studentsMsg.length <= 1) return;

    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % studentsMsg.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [studentsMsg.length]);

  useEffect(() => {
    if (parentsMsg.length <= 1) return;

    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % parentsMsg.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [parentsMsg.length]);

  useEffect(() => {
    if (teachersMsg.length <= 1) return;

    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % teachersMsg.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [teachersMsg.length]);

  useEffect(() => {
    if (staffsMsg.length <= 1) return;

    const interval = setInterval(() => {
      setActiveMessage((prev) => (prev + 1) % staffsMsg.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [staffsMsg.length]);

  //////////////////////////////////////////////

  if (isLoading) {
    return <LoadingOverlay isLoading />
  }

  if (isError) {
    return <ErrorStatusOverlay isError status={(error as any)?.response?.status ?? 500} message={error?.message} />
  }

  return (
    <div className="page_wrapper">
      <div className="dashboard" >
        <div className="school_details hvr_zm_in" >
          <p>Welcome</p>
          <h2>{data?.school_info?.school_name} <span className="pipe" >|</span> {data?.school_info?.suic_code} <span className="pipe" >|</span> {data?.school_info?.zone} <span className="pipe" >|</span> {data?.school_info?.category_of_institution}</h2>
          {/* <h2>School name, SUIC Code, Zone, Category of insitution</h2> */}
          {/* <h2>EC YES - Super Admin</h2> */}
        </div>

        <div className="widgets">
          {/* {data?.summary?.map((item, i) => <div key={i} className="widget"> */}
          {Object.entries(data?.summary ?? {})?.map(([key]) => <div key={key} className="widget hvr_zm_in">
            <div className="widget_head" >
              <div className="icon" >
                <img src={`/widget/${key}.png`} alt="student" />
                <p>{key}</p>
              </div>
              <div onClick={() => {
                if (key === "students") navigate("/student-info/add-student")
                else if (key === "teachers") navigate("/human-resource/add-staff")
                else if (key === "parents") navigate("/student-info/student-parents")
                else if (key === "staffs") navigate("/human-resource/add-staff")
              }} className="add_icon" >
                <img src="/widget/widget_plus.svg" alt="" />
              </div>
            </div>

            {key === "students" && <>
              <div className="widget_body">
                <p className="total_count" >{data?.card_stats?.students?.total_count}</p>
                <div className="notification" >
                  <img src="/widget/widget_notify.svg" alt="" />
                  <p>{data?.card_stats?.students?.new_this_month} new this month</p>
                </div>
              </div>

              <div className="widget_footer" >
                <div className="status_message">
                  <div className={`status_point ${studentsMsg[activeMessage]?.type}`} />
                  <p key={activeMessage} className="message_text" >
                    {studentsMsg[activeMessage]?.text}
                    {studentsMsg[activeMessage]?.count > 1 && (
                      <span className="count"> ({studentsMsg[activeMessage]?.count})</span>
                    )}
                  </p>
                </div>
                <PrimaryButton title={"View All"} onClick={() => navigate("/student-info/student-list")} />
              </div>
            </>}
            {key === "teachers" && <>
              <div className="widget_body">
                <p className="total_count" >{data?.card_stats?.teachers?.total_count}</p>
                <div className="notification" >
                  <img src="/widget/widget_notify.svg" alt="" />
                  <p>{data?.card_stats?.teachers?.new_this_month} new this month</p>
                </div>
              </div>

              <div className="widget_footer" >
                <div className="status_message">
                  <div className={`status_point ${teachersMsg[activeMessage]?.type}`} />
                  <p key={activeMessage} className="message_text">
                    {teachersMsg[activeMessage]?.text}
                    {teachersMsg[activeMessage]?.count > 1 && (
                      <span className="count"> ({teachersMsg[activeMessage].count})</span>
                    )}
                  </p>
                </div>
                <PrimaryButton title={"View All"} onClick={() => navigate("/human-resource/staff-list")} />
              </div>
            </>}
            {key === "parents" && <>
              <div className="widget_body">
                <p className="total_count" >{data?.card_stats?.parents?.total_count}</p>
                <div className="notification" >
                  <img src="/widget/widget_notify.svg" alt="" />
                  <p>{data?.card_stats?.parents?.new_this_month} new this month</p>
                </div>
              </div>

              <div className="widget_footer" >
                <div className="status_message">
                  <div className={`status_point ${parentsMsg[activeMessage]?.type}`} />
                  <p key={activeMessage} className="message_text">
                    {parentsMsg[activeMessage]?.text}
                    {parentsMsg[activeMessage]?.count > 1 && (
                      <span className="count"> ({parentsMsg[activeMessage].count})</span>
                    )}
                  </p>
                </div>
                <PrimaryButton title={"View All"} onClick={() => navigate("/student-info/student-parents")} />
              </div>
            </>}
            {key === "staffs" && <>
              <div className="widget_body">
                <p className="total_count" >{data?.card_stats?.staffs?.total_count}</p>
                <div className="notification" >
                  <img src="/widget/widget_notify.svg" alt="" />
                  <p>{data?.card_stats?.staffs?.new_this_month} new this month</p>
                </div>
              </div>

              <div className="widget_footer" >
                <div className="status_message">
                  <div className={`status_point ${staffsMsg[activeMessage]?.type}`} />
                  <p key={activeMessage} className="message_text">
                    {staffsMsg[activeMessage]?.text}
                    {staffsMsg[activeMessage]?.count > 1 && (
                      <span className="count"> ({staffsMsg[activeMessage].count})</span>
                    )}
                  </p>
                </div>
                <PrimaryButton title={"View All"} onClick={() => navigate("/human-resource/staff-list")} />
              </div>
            </>}

            {/* <>
              <div className="widget_body">
                <p className="total_count" >{value}</p>
                <div className="notification" >
                  <img src="/widget/widget_notify.svg" alt="" />
                  <p>4 new this month</p>
                </div>
              </div>

              <div className="widget_footer" >
                <div className="status_message" >
                  <div className="status_point"></div>
                  <p>2 <span>pending fee payments</span></p>
                </div>
                <PrimaryButton title={"View All"} onClick={() => {
                  if (key === "students") navigate("/student-info/student-list")
                  else if (key === "teachers") navigate("/human-resource/staff-list")
                  else if (key === "parents") navigate("/student-info/student-parents")
                  else if (key === "staffs") navigate("/human-resource/staff-list")
                }} />
              </div>
            </> */}

          </div>)}
        </div>


        <BigCalendar />
        <Footer />
      </div>
    </div>
  )
}

export default Dashboard;



// {/* {widgets.map((item, i) => <div key={i} className="widget">
//     <div className="widget_head" >
//       <div className="icon" >
//         <img src={item.icon} alt="student" />
//         <p>{item.title}</p>
//       </div>
//       <div className="add_icon" >
//         <img src="/widget/widget_plus.svg" alt="" />
//       </div>
//     </div>

//     <div className="widget_body">
//       <p className="total_count" >173</p>
//       <div className="notification" >
//         <img src="/widget/widget_notify.svg" alt="" />
//         <p>{item.notification}</p>
//       </div>
//     </div>

//     <div className="widget_footer">
//       <div className="status_message" >
//         <div className="status_point"></div>
//         <p>{item.info_count} <span>{item.info_message}</span></p>
//       </div>
//       <PrimaryButton title={"View All"} />
//     </div>
//   </div>)} */}

//  {/* Student Widget */}
//           <div className="widget">
//             <div className="widget_head" >
//               <div className="icon" >
//                 <img src={"/widget/student.png"} alt="student" />
//                 <p>Student</p>
//               </div>
//               <div className="add_icon" >
//                 <img src="/widget/widget_plus.svg" alt="" />
//               </div>
//             </div>

//             <div className="widget_body">
//               <p className="total_count" >{data?.summary.students}</p>
//               <div className="notification" >
//                 <img src="/widget/widget_notify.svg" alt="" />
//                 <p>4 new this month</p>
//               </div>
//             </div>

//             <div className="widget_footer">
//               <div className="status_message" >
//                 <div className="status_point"></div>
//                 <p>2 <span>pending fee payments</span></p>
//               </div>
//               <PrimaryButton title={"View All"} />
//             </div>
//           </div>

//           {/* Teachers Widget */}
//           <div className="widget">
//             <div className="widget_head" >
//               <div className="icon" >
//                 <img src={"/widget/teachers.png"} alt="teachers" />
//                 <p>Teachers</p>
//               </div>
//               <div className="add_icon" >
//                 <img src="/widget/widget_plus.svg" alt="" />
//               </div>
//             </div>

//             <div className="widget_body">
//               <p className="total_count" >{data?.summary.teachers}</p>
//               <div className="notification" >
//                 <img src="/widget/widget_notify.svg" alt="" />
//                 <p>4 new this month</p>
//               </div>
//             </div>

//             <div className="widget_footer">
//               <div className="status_message" >
//                 <div className="status_point"></div>
//                 <p>2 <span>pending fee payments</span></p>
//               </div>
//               <PrimaryButton title={"View All"} />
//             </div>
//           </div>

//           {/* Parents Widget */}
//           <div className="widget">
//             <div className="widget_head" >
//               <div className="icon" >
//                 <img src={"/widget/parents.png"} alt="parents" />
//                 <p>Parents</p>
//               </div>
//               <div className="add_icon" >
//                 <img src="/widget/widget_plus.svg" alt="" />
//               </div>
//             </div>

//             <div className="widget_body">
//               <p className="total_count" >{data?.summary.parents}</p>
//               <div className="notification" >
//                 <img src="/widget/widget_notify.svg" alt="" />
//                 <p>4 new this month</p>
//               </div>
//             </div>

//             <div className="widget_footer">
//               <div className="status_message" >
//                 <div className="status_point"></div>
//                 <p>2 <span>pending fee payments</span></p>
//               </div>
//               <PrimaryButton title={"View All"} />
//             </div>
//           </div>

//           {/* Staffs Widget */}
//           <div className="widget">
//             <div className="widget_head" >
//               <div className="icon" >
//                 <img src={"/widget/staffs.png"} alt="staffs" />
//                 <p>Staffs</p>
//               </div>
//               <div className="add_icon" >
//                 <img src="/widget/widget_plus.svg" alt="" />
//               </div>
//             </div>

//             <div className="widget_body">
//               <p className="total_count" >{data?.summary.staffs}</p>
//               <div className="notification" >
//                 <img src="/widget/widget_notify.svg" alt="" />
//                 <p>4 new this month</p>
//               </div>
//             </div>

//             <div className="widget_footer">
//               <div className="status_message" >
//                 <div className="status_point"></div>
//                 <p>2 <span>pending fee payments</span></p>
//               </div>
//               <PrimaryButton title={"View All"} />
//             </div>
//           </div>