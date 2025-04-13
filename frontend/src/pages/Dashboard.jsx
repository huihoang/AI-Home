import { React, useState, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import Navbar from "../components/Navbar";

const API_URL_TEMP =
  "https://io.adafruit.com/api/v2/hoangbk4/feeds/ai-home.bbc-temp/data";
const API_URL_HUMIDITY =
  "https://io.adafruit.com/api/v2/hoangbk4/feeds/bbc-humidity/data";
const API_URL_BRIGHTNESS =
  "https://io.adafruit.com/api/v2/hoangbk4/feeds/bbc-bright/data";

const Dashboard = () => {
  const [ledStatus, setLedStatus] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const today = new Date();
  const [fanStatus, setFanStatus] = useState(false);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [brightness, setBrightness] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const [doorStatus, setDoorStatus] = useState(false);
  const [fanLevel, setFanLevel] = useState(1);
  const recognitionRef = useRef(null);
  const [notes, setNotes] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState("");

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        const response = await fetch(API_URL_TEMP);
        const data = await response.json();
        if (data.length > 0) {
          const latestTemperature = parseFloat(data[0].value);
          setTemperature(latestTemperature);
        }
      } catch (error) {
        console.error("Error fetching temperature data:", error);
      }
    };

    const fetchHumidity = async () => {
      try {
        const response = await fetch(API_URL_HUMIDITY);
        const data = await response.json();
        if (data.length > 0) {
          const latestHumidity = parseFloat(data[0].value);
          setHumidity(latestHumidity);
        }
      } catch (error) {
        console.error("Error fetching humidity data:", error);
      }
    };

    const fetchBrightness = async () => {
      try {
        const response = await fetch(API_URL_BRIGHTNESS);
        const data = await response.json();
        if (data.length > 0) {
          const latestBrightness = parseFloat(data[0].value);
          setBrightness(latestBrightness);
        }
      } catch (error) {
        console.error("Error fetching brightness data:", error);
      }
    };

    fetchTemperature();
    fetchHumidity();
    fetchBrightness();

    const intervalId = setInterval(() => {
      fetchTemperature();
      fetchHumidity();
      fetchBrightness();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Calendar logic
  // Load ghi chú từ localStorage khi khởi động
  const NoteModal = ({ date, note, onSave, onDelete, onClose }) => {
    const [inputValue, setInputValue] = useState(note || "");

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "20px",
            borderRadius: "8px",
            width: "300px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Ghi chú ngày {format(date, "dd/MM/yyyy")}
          </h3>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: "100%",
              minHeight: "100px",
              margin: "10px 0",
              padding: "8px",
              border: `1px solid ${darkMode ? "#57606f" : "#dfe4ea"}`,
              backgroundColor: darkMode ? "#3d4852" : "#f1f2f6",
              color: darkMode ? "white" : "#2f3542",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              onClick={() => {
                onSave(inputValue);
                onClose();
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2ed573",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Lưu
            </button>

            {note && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ff4757",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: "8px 16px",
                backgroundColor: "#a4b0be",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    const savedNotes = localStorage.getItem("calendarNotes");
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, []);

  // Lưu ghi chú vào localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("calendarNotes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth()));
  }, []);
  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    const firstDay = start.getDay();
    const emptyDays = Array(firstDay).fill(null);

    setCalendarDays([...emptyDays, ...days]);
  }, [currentDate]);

  // const toggleLED = () => setLedStatus(!ledStatus);
  const toggleLED = async () => {
    setLedStatus(!ledStatus); // Update UI state immediately
    console.log(ledStatus);
    try {
      const response = await fetch("http://localhost:8080/led/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: ledStatus ? "OFF" : "ON", // Send appropriate command
        }),
      });
      const result = await response.json();
      console.log(result.message); // Log server response
    } catch (error) {
      console.error("Lỗi khi gửi lệnh:", error);
    }
  };
  const toggleFan = async () => {
    setFanStatus(!fanStatus);
    try {
      const response = await fetch("http://localhost:8080/fan/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: fanStatus ? "OFF" : "ON",
        }),
      });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error("Lỗi khi gửi lệnh:", error);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };
  const changeMonth = (offset) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset)
    );
  };
  const toggleVoiceControl = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Trình duyệt không hỗ trợ nhận diện giọng nói");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.lang = "vi-VN";
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(transcript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Lỗi nhận diện giọng nói:", event.error);
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };

  const handleVoiceCommand = (command) => {
    if (command.includes("bật đèn")) {
      setLedStatus(true);
    } else if (command.includes("tắt đèn")) {
      setLedStatus(false);
    } else if (command.includes("bật quạt")) {
      setFanStatus(true);
    } else if (command.includes("tắt quạt")) {
      setFanStatus(false);
    } else if (command.includes("mở cửa")) {
      setDoorStatus(true);
      setTimeout(() => setDoorStatus(false), 3000); // Tự động đóng sau 3s
    } else if (command.includes("đóng cửa")) {
      setDoorStatus(false);
    } else if (command.includes("quạt mức 1")) {
      setFanLevel(1);
    } else if (command.includes("quạt mức 2")) {
      setFanLevel(2);
    } else if (command.includes("quạt mức 3")) {
      setFanLevel(3);
    } else if (command.includes("quạt mức 4")) {
      setFanLevel(4);
    }
  };
  useEffect(() => {
    const speedMap = { 1: 25, 2: 50, 3: 75, 4: 100 };
    setFanSpeed(speedMap[fanLevel]);
  }, [fanLevel]);

  // Component DeviceStatus
  const DeviceStatus = ({ name, status, icon, darkMode }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "15px",
        backgroundColor: darkMode ? "#112240" : "#cce7ff",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        ":hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
        },
      }}
    >
      <div
        style={{
          fontSize: "28px",
          marginBottom: "10px",
          color: "#3498db",
        }}
      >
        {icon}
      </div>
      <span
        style={{
          color: darkMode ? "white" : "#0a192f",
          fontSize: "16px",
          fontWeight: "500",
          marginBottom: "8px",
        }}
      >
        {name}
      </span>
      <span
        style={{
          color: status ? "#1abc9c" : "#ff6b6b",
          fontWeight: "bold",
          fontSize: "14px",
          padding: "4px 12px",
          backgroundColor: darkMode
            ? status
              ? "rgba(26, 188, 156, 0.2)"
              : "rgba(255, 107, 107, 0.2)"
            : status
            ? "rgba(26, 188, 156, 0.1)"
            : "rgba(255, 107, 107, 0.1)",
          borderRadius: "20px",
        }}
      >
        {status ? "ĐANG BẬT" : "ĐANG TẮT"}
      </span>
    </div>
  );
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1));
  };
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Component styles
  const cardStyle = {
    backgroundColor: darkMode ? "#0a192f" : "#e6f7ff",
    borderRadius: 16,
    padding: 25,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s ease",
    ":hover": {
      transform: "translateY(-2px)",
    },
  };

  const subTitleStyle = {
    fontSize: 16,
    color: darkMode ? "#64ffda" : "#0077b6",
    marginBottom: 15,
    fontWeight: 600,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  };

  const listStyle = {
    fontSize: 14,
    color: darkMode ? "#dfe4ea" : "#57606f",
    lineHeight: 1.6,
    textAlign: "center",
  };

  const highlightStyle = {
    color: "#ff4757",
    fontWeight: 700,
    letterSpacing: 0.5,
  };

  const buttonStyle = {
    border: "none",
    background: "none",
    fontSize: 24,
    cursor: "pointer",
    padding: "8px 12px",
    borderRadius: "50%",
    color: darkMode ? "#dfe4ea" : "#57606f",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: darkMode ? "#57606f" : "#f1f2f6",
      color: darkMode ? "white" : "#2f3542",
    },
  };

  const calendarGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 5,
  };

  const calendarHeaderStyle = {
    padding: 10,
    textAlign: "center",
    fontWeight: 600,
    color: "#57606f",
    fontSize: 12,
    textTransform: "uppercase",
  };

  const calendarDayStyle = {
    padding: 10,
    textAlign: "center",
    borderRadius: 8,
    minHeight: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#f8f9fa",
    },
  };

  const sensorTitleStyle = {
    fontSize: 18,
    color: darkMode ? "white" : "#2f3542",
    fontWeight: 700,
    textAlign: "center",
    margin: "15px 0",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  };
  const FanControl = () => (
    <div
      style={{
        ...cardStyle,
        backgroundColor: darkMode ? "#2f3542" : "white",
        color: darkMode ? "white" : "#2f3542",
      }}
    >
      <div style={sensorTitleStyle}>FAN CONTROL</div>

      {/* Fan Toggle Switch */}
      <div
        style={{
          position: "relative",
          width: 100,
          height: 40,
          backgroundColor: fanStatus ? "#2ed573" : "#ff4757",
          borderRadius: 20,
          cursor: "pointer",
          margin: "20px auto",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onClick={toggleFan}
      >
        <div
          style={{
            position: "absolute",
            left: fanStatus ? "calc(100% - 35px)" : "5px",
            top: "50%",
            transform: "translateY(-50%)",
            width: 30,
            height: 30,
            backgroundColor: "white",
            borderRadius: "50%",
            transition: "left 0.3s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontWeight: "bold",
            pointerEvents: "none",
            userSelect: "none",
            fontSize: 14,
          }}
        >
          {fanStatus ? "ON" : "OFF"}
        </div>
      </div>

      {/* Fan Speed Levels - Only show when fan is on */}
      {fanStatus && (
        <div style={{ padding: "0 20px", marginTop: "15px" }}>
          <div
            style={{
              textAlign: "center",
              color: darkMode ? "#dfe4ea" : "#57606f",
              marginBottom: "10px",
              fontSize: "14px",
            }}
          >
            Chọn mức quạt:
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => setFanLevel(level)}
                style={{
                  padding: "8px",
                  backgroundColor:
                    fanLevel === level
                      ? "#2ed573"
                      : darkMode
                      ? "#57606f"
                      : "#f1f2f6",
                  color:
                    fanLevel === level
                      ? "white"
                      : darkMode
                      ? "white"
                      : "#2f3542",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  const slideContainerStyle = {
    position: "relative",
    width: "100%",
    height: "calc(100vh - 0px)",
    overflow: "hidden",
    paddingTop: "20px", // Đảm bảo không bị Navbar che
  };

  const slidesWrapperStyle = {
    display: "flex",
    height: "100%",
    transition: "transform 0.5s ease",
    transform: `translateX(-${currentSlide * 100}%)`,
  };

  const slideStyle = {
    minWidth: "100%",
    height: "100%",
    padding: "20px",
    boxSizing: "border-box",
  };

  const navButtonStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "20px",
    cursor: "pointer",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const prevButtonStyle = {
    ...navButtonStyle,
    left: "10px",
  };

  const nextButtonStyle = {
    ...navButtonStyle,
    right: "10px",
  };

  const indicatorContainerStyle = {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "10px",
    zIndex: 10,
  };

  const indicatorStyle = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.5)",
    cursor: "pointer",
  };

  const activeIndicatorStyle = {
    ...indicatorStyle,
    backgroundColor: "white",
  };

  // Component definitions
  const HumidityGauge = ({ humidity }) => {
    const minHumidity = 0;
    const maxHumidity = 100;
    const height =
      ((humidity - minHumidity) / (maxHumidity - minHumidity)) * 100;

    return (
      <div
        style={{
          position: "relative",
          width: 60,
          height: 200,
          margin: "0 auto",
          backgroundColor: "#e0e0e0",
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${height}%`,
            backgroundColor: "#2ed573",
            transition: "height 0.5s ease",
            background: "linear-gradient(to top, #7bed9f, #2ed573)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 24,
            fontWeight: "bold",
            color: "#2f3542",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {humidity}%
        </div>
      </div>
    );
  };

  const BrightnessIndicator = ({ brightness }) => {
    const minBrightness = 0;
    const maxBrightness = 100;
    const height =
      ((brightness - minBrightness) / (maxBrightness - minBrightness)) * 100;

    return (
      <div
        style={{
          position: "relative",
          width: 60,
          height: 200,
          margin: "0 auto",
          backgroundColor: "#e0e0e0",
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${height}%`,
            backgroundColor: "#ffa502",
            transition: "height 0.5s ease",
            background: "linear-gradient(to top, #ffb142, #ffa502)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 24,
            fontWeight: "bold",
            color: "#2f3542",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {brightness}%
        </div>
      </div>
    );
  };

  const Thermometer = ({ temperature }) => {
    const minTemp = 0;
    const maxTemp = 50;
    const height = ((temperature - minTemp) / (maxTemp - minTemp)) * 100;

    // Xác định màu gradient dựa trên nhiệt độ
    let colorStart, colorEnd;
    if (temperature <= 15) {
      colorStart = "#3498db"; // Xanh dương nhạt
      colorEnd = "#2980b9"; // Xanh dương đậm
    } else if (temperature <= 30) {
      colorStart = "#f1c40f"; // Vàng nhạt
      colorEnd = "#f39c12"; // Vàng cam
    } else {
      colorStart = "#e74c3c"; // Đỏ nhạt
      colorEnd = "#c0392b"; // Đỏ đậm
    }

    return (
      <div
        style={{
          position: "relative",
          width: 60,
          height: 200,
          margin: "0 auto",
          backgroundColor: darkMode ? "#112240" : "#cce7ff",
          borderRadius: 30,
          overflow: "hidden",
          boxShadow: "inset 0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: `${height}%`,
            background: `linear-gradient(to top, ${colorStart}, ${colorEnd})`,
            transition: "height 0.5s ease, background 0.5s ease",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 24,
            fontWeight: "bold",
            color: darkMode ? "white" : "#0a192f",
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          {temperature}°C
        </div>
      </div>
    );
  };

  // Slide components
  const SensorSlide = () => (
    <div
      style={{
        ...slideStyle,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h2
        style={{
          color: darkMode ? "white" : "#2f3542",
          marginBottom: "30px",
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "600",
          letterSpacing: "1px",
        }}
      >
        THÔNG TIN CẢM BIẾN
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "25px",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* Temperature */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            borderRadius: "12px",
          }}
        >
          <div style={sensorTitleStyle}>NHIỆT ĐỘ</div>
          {temperature !== null ? (
            <div style={{ position: "relative", height: "200px" }}>
              <Thermometer temperature={temperature} darkMode={darkMode} />
              <div
                style={{
                  marginTop: "10px", // Giảm margin
                  textAlign: "center",
                  color: darkMode ? "#a4b0be" : "#57606f",
                  fontSize: "14px",
                  padding: "0 10px", // Thêm padding để chữ không bị tràn
                }}
              >
                {temperature > 30
                  ? "Nhiệt độ cao"
                  : temperature < 20
                  ? "Nhiệt độ thấp"
                  : "Nhiệt độ lý tưởng"}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: darkMode ? "#a4b0be" : "#57606f",
              }}
            >
              Đang tải dữ liệu...
            </div>
          )}
        </div>

        {/* Humidity */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            borderRadius: "12px",
          }}
        >
          <div style={sensorTitleStyle}>ĐỘ ẨM</div>
          {humidity !== null ? (
            <div style={{ position: "relative", height: "200px" }}>
              <HumidityGauge humidity={humidity} />
              <div
                style={{
                  marginTop: "10px", // Giảm margin
                  textAlign: "center",
                  color: darkMode ? "#a4b0be" : "#57606f",
                  fontSize: "14px",
                  padding: "0 10px", // Thêm padding để chữ không bị tràn
                }}
              >
                {humidity > 70
                  ? "Độ ẩm cao"
                  : humidity < 30
                  ? "Độ ẩm thấp"
                  : "Độ ẩm lý tưởng"}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: darkMode ? "#a4b0be" : "#57606f",
              }}
            >
              Đang tải dữ liệu...
            </div>
          )}
        </div>

        {/* Brightness */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            borderRadius: "12px",
          }}
        >
          <div style={sensorTitleStyle}>ÁNH SÁNG</div>
          {brightness !== null ? (
            <div style={{ position: "relative", height: "200px" }}>
              <BrightnessIndicator brightness={brightness} />
              <div
                style={{
                  marginTop: "10px", // Giảm margin
                  textAlign: "center",
                  color: darkMode ? "#a4b0be" : "#57606f",
                  fontSize: "14px",
                  padding: "0 10px", // Thêm padding để chữ không bị tràn
                }}
              >
                {brightness > 70
                  ? "Ánh sáng mạnh"
                  : brightness < 30
                  ? "Ánh sáng yếu"
                  : "Ánh sáng vừa phải"}
              </div>
            </div>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: darkMode ? "#a4b0be" : "#57606f",
              }}
            >
              Đang tải dữ liệu...
            </div>
          )}
        </div>
      </div>

      {/* Device Status */}
      <div
        style={{
          ...cardStyle,
          width: "100%",
          maxWidth: "1200px", // Đảm bảo cùng maxWidth với thông tin cảm biến
          backgroundColor: darkMode ? "#2f3542" : "white",
          padding: "25px",
          marginTop: "30px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          borderRadius: "12px",
        }}
      >
        <h3
          style={{
            textAlign: "center",
            color: darkMode ? "white" : "#2f3542",
            marginBottom: "25px",
            fontSize: "20px",
            fontWeight: "600",
          }}
        >
          TRẠNG THÁI THIẾT BỊ
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <DeviceStatus
            name="ĐÈN LED"
            status={ledStatus}
            icon="💡"
            darkMode={darkMode}
          />
          <DeviceStatus
            name="QUẠT"
            status={fanStatus}
            icon="🌀"
            darkMode={darkMode}
          />
          <DeviceStatus
            name="CỬA"
            status={doorStatus}
            icon="🚪"
            darkMode={darkMode}
          />

          {fanStatus && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "15px",
                backgroundColor: darkMode ? "#3d4852" : "#f1f2f6",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    color: darkMode ? "white" : "#2f3542",
                    fontSize: "14px",
                    marginRight: "8px",
                  }}
                >
                  TỐC ĐỘ QUẠT
                </span>
                <span
                  style={{
                    color: "#2ed573",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {fanLevel}
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: darkMode ? "#57606f" : "#dfe4ea",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${fanLevel * 25}%`,
                    height: "100%",
                    backgroundColor: "#2ed573",
                    transition: "width 0.3s ease",
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CalendarSlide = () => {
    // Hàm mở modal nhập ghi chú
    const handleAddNote = (day) => {
      if (!day) return;
      const dateKey = format(day, "yyyy-MM-dd");
      const currentNote = notes[dateKey] || "";
      const newNote = prompt("Nhập ghi chú:", currentNote);
      if (newNote !== null) {
        setNotes({ ...notes, [dateKey]: newNote });
      }
    };

    return (
      <div
        style={{
          ...slideStyle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Phần hiển thị thời gian và lịch */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            marginBottom: "20px",
            color: darkMode ? "white" : "#2f3542",
          }}
        >
          {format(currentTime, "HH:mm:ss")}
        </div>

        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            width: "100%",
          }}
        >
          {/* Header lịch */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <button onClick={() => changeMonth(-1)} style={buttonStyle}>
              ‹
            </button>
            <div style={subTitleStyle}>{format(currentDate, "MMMM yyyy")}</div>
            <button onClick={() => changeMonth(1)} style={buttonStyle}>
              ›
            </button>
          </div>

          {/* Lưới lịch */}
          <div style={calendarGridStyle}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} style={calendarHeaderStyle}>
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => handleAddNote(day)}
                style={{
                  ...calendarDayStyle,
                  backgroundColor:
                    day && isSameDay(day, today)
                      ? "#ffeaa7"
                      : darkMode
                      ? "#57606f"
                      : "white",
                  color:
                    day && !isSameMonth(day, currentDate)
                      ? "#ccc"
                      : darkMode
                      ? "white"
                      : "#2f3542",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                {day ? format(day, "d") : ""}
                {/* Hiển thị biểu tượng ghi chú nếu có */}
                {day && notes[format(day, "yyyy-MM-dd")] && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 5,
                      right: 5,
                      width: 8,
                      height: 8,
                      backgroundColor: "#ff4757",
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hiển thị ghi chú của ngày được chọn */}
        {selectedDate && notes[format(selectedDate, "yyyy-MM-dd")] && (
          <div
            style={{
              ...cardStyle,
              marginTop: 20,
              backgroundColor: darkMode ? "#3d4852" : "#f1f2f6",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 10 }}>
              Ghi chú ngày {format(selectedDate, "dd/MM/yyyy")}:
            </div>
            <div>{notes[format(selectedDate, "yyyy-MM-dd")]}</div>
          </div>
        )}
      </div>
    );
  };

  const ControlSlide = () => (
    <div
      style={{
        ...slideStyle,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "30px 20px",
        overflowY: "auto",
      }}
    >
      <h2
        style={{
          color: darkMode ? "white" : "#2f3542",
          margin: "0 0 30px 0",
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "600",
          letterSpacing: "1px",
        }}
      >
        ĐIỀU KHIỂN THIẾT BỊ
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "30px",
          width: "100%",
          maxWidth: "1000px",
        }}
      >
        {/* LED Control */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                marginRight: "10px",
              }}
            >
              💡
            </span>
            <h3
              style={{
                ...sensorTitleStyle,
                margin: "0",
                fontSize: "20px",
              }}
            >
              ĐÈN LED
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "60px",
                backgroundColor: ledStatus ? "#2ed573" : "#ff4757",
                borderRadius: "30px",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
              onClick={toggleLED}
            >
              <div
                style={{
                  position: "absolute",
                  left: ledStatus ? "calc(100% - 55px)" : "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s ease",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  userSelect: "none",
                  fontSize: "16px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {ledStatus ? "ON" : "OFF"}
              </div>
            </div>
          </div>
        </div>

        {/* Fan Control */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                marginRight: "10px",
              }}
            >
              🌀
            </span>
            <h3
              style={{
                ...sensorTitleStyle,
                margin: "0",
                fontSize: "20px",
              }}
            >
              ĐIỀU KHIỂN QUẠT
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "60px",
                backgroundColor: fanStatus ? "#2ed573" : "#ff4757",
                borderRadius: "30px",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
              onClick={toggleFan}
            >
              <div
                style={{
                  position: "absolute",
                  left: fanStatus ? "calc(100% - 55px)" : "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s ease",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  userSelect: "none",
                  fontSize: "16px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {fanStatus ? "ON" : "OFF"}
              </div>
            </div>

            {fanStatus && (
              <div
                style={{
                  width: "100%",
                  marginTop: "15px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    color: darkMode ? "#a4b0be" : "#57606f",
                    fontSize: "16px",
                    marginBottom: "15px",
                    fontWeight: "500",
                  }}
                >
                  Tốc độ quạt:{" "}
                  <span
                    style={{
                      fontWeight: "700",
                      color: "#2ed573",
                      fontSize: "18px",
                    }}
                  >
                    MỨC {fanLevel}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                    marginBottom: "20px",
                  }}
                >
                  {[1, 2, 3, 4].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFanLevel(level)}
                      style={{
                        padding: "10px 0",
                        backgroundColor:
                          fanLevel === level
                            ? "#2ed573"
                            : darkMode
                            ? "#57606f"
                            : "#f1f2f6",
                        color:
                          fanLevel === level
                            ? "white"
                            : darkMode
                            ? "white"
                            : "#2f3542",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        ":hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Door Control */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                marginRight: "10px",
              }}
            >
              🚪
            </span>
            <h3
              style={{
                ...sensorTitleStyle,
                margin: "0",
                fontSize: "20px",
              }}
            >
              CỬA RA VÀO
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "60px",
                backgroundColor: doorStatus ? "#2ed573" : "#ff4757",
                borderRadius: "30px",
                cursor: "pointer",
                marginBottom: "20px",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              }}
              onClick={async () => {
                setDoorStatus(!doorStatus);
                console.log(doorStatus);
                try {
                  const response = await fetch(
                    "http://localhost:8080/hangclothe/update-status",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        status: doorStatus ? "OFF" : "ON", // Send appropriate command
                      }),
                    }
                  );
                  const result = await response.json();
                  console.log(result.message); // Log server response
                } catch (error) {
                  console.error("Lỗi khi gửi lệnh:", error);
                }
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: doorStatus ? "calc(100% - 55px)" : "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "50px",
                  height: "50px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  transition: "left 0.3s ease",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "white",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  userSelect: "none",
                  fontSize: "16px",
                  width: "100%",
                  textAlign: "center",
                }}
              >
                {doorStatus ? "ON" : "OFF"}
              </div>
            </div>
          </div>
        </div>

        {/* Voice Control */}
        <div
          style={{
            ...cardStyle,
            backgroundColor: darkMode ? "#2f3542" : "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            gridColumn: "1 / -1",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                marginRight: "10px",
              }}
            >
              🎤
            </span>
            <h3
              style={{
                ...sensorTitleStyle,
                margin: "0",
                fontSize: "20px",
              }}
            >
              ĐIỀU KHIỂN BẰNG GIỌNG NÓI
            </h3>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0 20px",
            }}
          >
            <button
              onClick={toggleVoiceControl}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                backgroundColor: isRecording ? "#ff4757" : "#2ed573",
                border: "none",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                ":hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              {isRecording ? (
                <>
                  <div
                    style={{
                      fontSize: "36px",
                      marginBottom: "5px",
                      animation: "pulse 1.5s infinite",
                    }}
                  >
                    🎤
                  </div>
                  <div>ĐANG NGHE...</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "36px", marginBottom: "5px" }}>
                    🎤
                  </div>
                  <div>BẤM ĐỂ NÓI</div>
                </>
              )}
            </button>

            <div
              style={{
                textAlign: "center",
                color: darkMode ? "#a4b0be" : "#57606f",
                fontSize: "16px",
                marginBottom: "20px",
              }}
            >
              {isRecording
                ? "Hãy ra lệnh bằng giọng nói..."
                : "Nhấn vào micro và ra lệnh bằng giọng nói"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const CameraSlide = () => (
    <div
      style={{
        ...slideStyle,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h2
        style={{
          color: darkMode ? "white" : "#2f3542",
          marginBottom: "30px",
          textAlign: "center",
          fontSize: "28px",
          fontWeight: "600",
          letterSpacing: "1px",
        }}
      >
        CAMERA GIÁM SÁT
      </h2>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          aspectRatio: "16/9",
          backgroundColor: darkMode ? "#57606f" : "#dfe4ea",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          marginBottom: "30px",
        }}
      >
        {ledStatus ? (
          <>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, #2f3542, #57606f)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  color: "#a4b0be",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📷</div>
                <div>Camera đang hoạt động</div>
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                backgroundColor: "#ff4757",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                animation: "pulse 1.5s infinite",
              }}
            ></div>
          </>
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: darkMode ? "#a4b0be" : "#57606f",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>📷</div>
              <div>Camera đang tắt</div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
      >
        <button
          onClick={toggleLED}
          style={{
            padding: "12px 24px",
            backgroundColor: ledStatus ? "#ff4757" : "#2ed573",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            ":hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
            },
          }}
        >
          {ledStatus ? (
            <>
              <span style={{ marginRight: "8px" }}>🔴</span>
              TẮT CAMERA
            </>
          ) : (
            <>
              <span style={{ marginRight: "8px" }}>🟢</span>
              BẬT CAMERA
            </>
          )}
        </button>

        {ledStatus && (
          <button
            style={{
              padding: "12px 24px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              ":hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              },
            }}
          >
            <span style={{ marginRight: "8px" }}>📸</span>
            CHỤP ẢNH
          </button>
        )}
      </div>

      {ledStatus && (
        <div
          style={{
            marginTop: "30px",
            width: "100%",
            maxWidth: "800px",
            backgroundColor: darkMode ? "#2f3542" : "white",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          }}
        >
          <h3
            style={{
              color: darkMode ? "white" : "#2f3542",
              marginTop: "0",
              marginBottom: "15px",
              fontSize: "18px",
            }}
          >
            LỊCH SỬ HOẠT ĐỘNG
          </h3>
          <div
            style={{
              height: "150px",
              overflowY: "auto",
              padding: "10px",
              backgroundColor: darkMode ? "#3d4852" : "#f1f2f6",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${darkMode ? "#57606f" : "#dfe4ea"}`,
                fontSize: "14px",
              }}
            >
              <span>12:30:45 - Phát hiện chuyển động</span>
              <span style={{ color: "#ff4757" }}>Cảnh báo</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: `1px solid ${darkMode ? "#57606f" : "#dfe4ea"}`,
                fontSize: "14px",
              }}
            >
              <span>12:15:22 - Camera bật</span>
              <span style={{ color: "#2ed573" }}>Thông tin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#0a192f" : "#e6f7ff",
        color: darkMode ? "white" : "#0a192f",
      }}
    >
      <Navbar
        darkMode={darkMode}
        onLogout={handleLogout}
        onDarkModeToggle={setDarkMode}
      />

      <div style={slideContainerStyle}>
        <button onClick={prevSlide} style={prevButtonStyle}>
          ‹
        </button>
        <button onClick={nextSlide} style={nextButtonStyle}>
          ›
        </button>

        <div style={slidesWrapperStyle}>
          <SensorSlide />
          <CalendarSlide />
          <ControlSlide />
          <CameraSlide />
        </div>

        <div style={indicatorContainerStyle}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={
                index === currentSlide ? activeIndicatorStyle : indicatorStyle
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
