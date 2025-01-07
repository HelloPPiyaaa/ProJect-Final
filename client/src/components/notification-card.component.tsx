import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import NotificationCommentField from "./notification-content-field";
import "../misc/blogpage.css";
import { UserContext } from "../App";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

interface NotificationCardProps {
  data: {
    seen?: any;
    type?: string;
    reply?: any;
    comment?: any;
    replied_on_comment?: any;
    createdAt?: string;
    user?: {
      fullname: string;
      username: string;
      profile_picture: string;
    };
    blog?: {
      _id: string;
      blog_id: string;
      topic: string;
    } | null;
    _id?: string;
  };
  index?: number;
  notificationState?: any;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  data,
  index,
  notificationState,
}) => {
  let [isReplying, setReplying] = useState(false);
  const {
    seen,
    type,
    reply,
    createdAt,
    replied_on_comment,
    comment,
    user,
    user: userData,
    _id: notification_id,
    blog,
  } = data;

  const { _id = "", blog_id = "", topic = "Untitled" } = blog || {};

  const fullname = userData?.fullname || "Unknown";
  const username = userData?.username || "unknown";
  const profile_picture = userData?.profile_picture || "";
  let {
    userAuth: {
      username: author_username,
      profile_picture: author_profile_img,
      access_token,
    },
  } = useContext(UserContext);

  let {
    notifications,
    notifications: { result, totalDocs },
    setNotifications,
  } = notificationState;

  const handleReplyClick = () => {
    setReplying((preVal) => !preVal);
  };

  const handleDelete = (
    comment_id: string,
    type: string,
    target: HTMLElement
  ) => {
    target.setAttribute("disabled", "true");

    axios
      .post(
        API_BASE_URL + "/create-blog/delete-comment",
        { _id: comment_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(() => {
        if (type === "comment") {
          result.splice(index, 1);
        } else {
          if (index !== undefined && index >= 0 && result[index]) {
            delete result[index].reply;
          }
        }
        target.removeAttribute("disabled");

        setNotifications({
          ...notifications,
          result,
          totalDocs: totalDocs - 1,
          deleteDocCount: notifications.deleteDocCount + 1,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className={
        "notification-card " +
        (!seen ? "border-start border-2 border-black" : "")
      }
    >
      <div className="d-flex gap-3 mb-3">
        <img
          src={profile_picture}
          alt=""
          className="rounded-circle"
          style={{ width: "3.5rem", height: "3.5rem", flex: "none" }}
        />

        <div className="w-100">
          <h1
            className="fw-medium"
            style={{ color: "#494949", fontSize: "16px" }}
          >
            <span className="responsive-text">{fullname}</span>
            <Link
              to={`/user/${username}`}
              className="mx-1 underline"
              style={{ color: "black" }}
            >
              @{username}
            </Link>
            <span className="fw-normal">
              {type === "like"
                ? "ถูกใจบล็อกของคุณ"
                : type === "comment"
                ? "แสดงความคิดเห็น"
                : "ตอบกลับ"}
            </span>
          </h1>
          {type === "reply" ? (
            <div className="p-3 rounded mt-3" style={{ background: "#f0f0f0" }}>
              <p className="m-0">{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              to={`/blog/${blog_id}`}
              className="fw-medium link-underline link-underline-opacity-0 link-underline-opacity-75-hover link-dark"
              style={{
                color: "#494949",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
              }}
            >{`"${topic}"`}</Link>
          )}
        </div>
      </div>

      {type !== "like" ? (
        <p className="m-0 ms-5 ps-3 my-2" style={{ fontSize: "18px" }}>
          {comment.comment}
        </p>
      ) : (
        ""
      )}

      <div className="ms-5 ps-3 mt-3 d-flex gap-4" style={{ color: "#494949" }}>
        <p className="m-0">{getDay(createdAt || "null")}</p>
        {type !== "like" ? (
          <>
            {!reply ? (
              <button
                className="text-decoration-underline"
                style={{ color: "inherit", transition: "color 0.2s" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "black")}
                onMouseOut={(e) => (e.currentTarget.style.color = "")}
                onClick={handleReplyClick}
              >
                ตอบกลับ
              </button>
            ) : (
              ""
            )}
            <button
              className="text-decoration-underline"
              style={{ color: "inherit", transition: "color 0.2s" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "black")}
              onMouseOut={(e) => (e.currentTarget.style.color = "")}
              onClick={(e) =>
                handleDelete(comment._id, "comment", e.target as HTMLElement)
              }
            >
              ลบ
            </button>
          </>
        ) : (
          ""
        )}
      </div>
      {isReplying ? (
        <div className="mt-4">
          <NotificationCommentField
            _id={_id}
            blog_author={{ _id: "", ...user }}
            index={index}
            replyingTo={comment._id}
            setReplying={setReplying}
            notification_id={notification_id || ""}
            notificationData={notificationState}
          />
        </div>
      ) : (
        ""
      )}

      {reply ? (
        <div
          className="ms-5 p-4 mt-4 rounded"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <div className="d-flex gap-3 mb-3">
            <img
              src={author_profile_img}
              alt=""
              className="rounded-circle"
              style={{ width: "2rem", height: "2rem" }}
            />

            <div>
              <h1
                className="fw-medium"
                style={{ color: "#494949", fontSize: "16px" }}
              >
                <Link
                  to={`/user/${author_username}`}
                  className="mx-1 underline"
                  style={{ color: "black" }}
                >
                  @{author_username}
                </Link>

                <span className="fw-normal">ตอบกลับถึง</span>

                <Link
                  to={`/user/${username}`}
                  className="mx-1 underline"
                  style={{ color: "black" }}
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p className="ms-5 my-2" style={{ fontSize: "16px" }}>
            {reply.comment}
          </p>

          <button
            className="text-decoration-underline text-black ms-5 mt-2"
            onMouseEnter={(e) => e.currentTarget.classList.add("text-black")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("text-black")}
            onClick={(e) =>
              handleDelete(comment._id, "reply", e.target as HTMLElement)
            }
          >
            ลบ
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NotificationCard;
