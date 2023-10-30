import React, {useContext, useEffect, useRef, useState} from 'react';
import {useSelector} from "react-redux";
import dayjs from "dayjs";
import InfoParagraph from "../../../ui/InfoParagraph/InfoParagraph";
import Avatar from "../../../ui/Avatar/Avatar";
import {Components} from "../../Item/components/ItemData";
import InputContainer from "../../Messenger/Input/InputContainer";
import {CommentsContext, CommentsInput} from "./CommentsContainer";
import Jdenticon from "react-jdenticon";
import "./Comment.scss";

const Comment = ({data}) => {
    const users = useSelector(state => state.users.users);
    const [reply, setReply] = useState(false);
    const upload = data.value.upload;
    const user = users[data.user] || data.user;
    const manager = useContext(CommentsContext);
    const ref = useRef();
    useEffect(() => {
        if (reply) ref.current.classList.add('visible');
    }, [reply]);
    return (
        <div className={"comment"}>
            <div className="comment-block">
                {user.picture ? <Avatar symbol={user.name} src={user.picture}></Avatar> :
                <div className={'avatar'}>
                    <Jdenticon size="40" value={user.name + user.email} />
                </div>}
                <div className="comment-block__text">
                    <p className={"comment-username"}>{user.name || 'Гость'}</p>
                    <p className={"comment-date"}>{dayjs(data.timeSent).format("HH:mm DD.MM.YYYY")}</p>
                </div>
            </div>
            <InfoParagraph type={'comment'}>{data.value.text}</InfoParagraph>
            {!!upload && !!upload.url && !!upload.type && React.createElement(Components[upload.type], {data:upload})}
            <div className={"comment-reply__button"} onClick={() => {
                if (ref.current) {
                    ref.current.classList.remove('visible');
                    setTimeout(() => setReply(r => !r), 180)
                } else {
                    setReply(r => !r)
                }
           }}>Ответить</div>
            {reply && <div className={"comment-reply"} ref={ref}>
                <InputContainer extraFields={{parent: data.id}}
                                children={CommentsInput}
                                manager={manager}></InputContainer>
            </div>}
        </div>
    );
};

export default Comment;