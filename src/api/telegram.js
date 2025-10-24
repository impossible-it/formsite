import fetch from "node-fetch";

const baseUrl = `https://api.telegram.org/bot6103649845:AAFjnPtWb_IQedYjVR_UTHIivyVrn04aTwE/`;

export const sendMessage = async (message) => {
  const url = `${baseUrl}sendMessage?chat_id=${process.env.TG_CHAT_ID}&text=${encodeURIComponent(message)}`;
  

  const response = await fetch(url);
  const data = await response.json();
  console.log("Telegram response:", data);
};
