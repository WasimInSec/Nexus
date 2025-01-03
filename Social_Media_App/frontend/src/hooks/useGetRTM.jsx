import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { messages } = useSelector((store) => store.chat);
  const { selectedUser } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Only update messages if they're from/to the currently selected user
      if (
        newMessage.senderId === selectedUser?._id ||
        newMessage.receiverId === selectedUser?._id
      ) {
        dispatch(setMessages([...messages, newMessage]));
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, messages, selectedUser, dispatch]);
};

export default useGetRTM;
