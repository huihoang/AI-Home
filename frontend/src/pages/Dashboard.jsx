import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import mqtt from 'mqtt';
const API_URL_TEMP = "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-temperature/data";
const API_URL_HUMIDITY = "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-humidity/data";
const API_URL_BRIGHTNESS = "https://io.adafruit.com/api/v2/hoangbk4/feeds/sensor-light/data";

const loadDashboardState = () => {
  const savedState = localStorage.getItem('dashboardState');
  if (savedState) {
    try {
      return JSON.parse(savedState);
    } catch (e) {
      console.error('Failed to parse saved state', e);
      return null;
    }
  }
  return null;
};
const saveDashboardState = (state) => {
  try {
    localStorage.setItem('dashboardState', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};
const Dashboard = () => {
  const initialState = loadDashboardState();
  const today = new Date();

  const [ledStatus, setLedStatus] = useState(initialState?.ledStatus || false);
  const [currentDate, setCurrentDate] = useState(initialState?.currentDate ? new Date(initialState.currentDate) : new Date(today.getFullYear(), today.getMonth()));
  const [calendarDays, setCalendarDays] = useState([]);
  const [fanStatus, setFanStatus] = useState(initialState?.fanStatus || false);
  const [fanSpeed, setFanSpeed] = useState(initialState?.fanSpeed || 0);
  const [darkMode, setDarkMode] = useState(initialState?.darkMode || false);
  const [temperature, setTemperature] = useState(initialState?.temperature || null);
  const [humidity, setHumidity] = useState(initialState?.humidity || null);
  const [brightness, setBrightness] = useState(initialState?.brightness || null);
  const [currentSlide, setCurrentSlide] = useState(initialState?.currentSlide || 0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [doorStatus, setDoorStatus] = useState(initialState?.doorStatus || false);
  const [fanLevel, setFanLevel] = useState(initialState?.fanLevel || 1);
  const [notes, setNotes] = useState(initialState?.notes || {});
  const [selectedDate, setSelectedDate] = useState(initialState?.selectedDate ? new Date(initialState.selectedDate) : null);
  const [systemHistory, setSystemHistory] = useState(initialState?.systemHistory || []);
  const [detectionHistory, setDetectionHistory] = useState(initialState?.detectionHistory || []);
  const [sensorDataHistory, setSensorDataHistory] = useState({
    temperature: [],
    humidity: [],
    brightness: []
  });
  const [notifications, setNotifications] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState(null);
  const timeRef = useRef(new Date());
  const [displayTime, setDisplayTime] = useState(format(new Date(), 'HH:mm:ss'));
  const [activeSlide, setActiveSlide] = useState(currentSlide);

  const [thresholds, setThresholds] = useState({
    temperature: { min: 20, max: 30 },
    humidity: { min: 40, max: 70 },
    brightness: { min: 30, max: 80 }
  });
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        data: [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y',
        tension: 0.1
      },
      {
        label: 'Độ ẩm (%)',
        data: [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        yAxisID: 'y1',
        tension: 0.1
      },
      {
        label: 'Ánh sáng (%)',
        data: [],
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        yAxisID: 'y1',
        tension: 0.1
      }
    ]
  });
  const [activityChartData, setActivityChartData] = useState({
    labels: ['Đèn', 'Quạt', 'Cửa'],
    datasets: [
      {
        label: 'Số lần bật',
        data: [0, 0, 0],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      }
    ]
  });
  const stateToSave = useMemo(() => ({
    ledStatus,
    currentDate: currentDate.getTime(),
    fanStatus,
    fanSpeed,
    darkMode,
    temperature,
    humidity,
    brightness,
    currentSlide,
    doorStatus,
    fanLevel,
    notes,
    selectedDate: selectedDate?.getTime(),
    systemHistory,
    detectionHistory,
    sensorDataHistory
  }), [
    ledStatus, currentDate, fanStatus, fanSpeed, darkMode, temperature,
    humidity, brightness, currentSlide, doorStatus, fanLevel, notes,
    selectedDate, systemHistory, detectionHistory, sensorDataHistory
  ]);
  const fetchThresholds = async () => {

    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser?._id;

      if (!userId) return;

      const response = await axios.get(`http://localhost:8080/config`, {
        headers:
        {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      const userConfig = response.data;

      if (userConfig && userConfig.thresholds) {
        setThresholds({
          temperature: {
            min: userConfig.thresholds.temperature.low,
            max: userConfig.thresholds.temperature.high
          },
          humidity: {
            min: userConfig.thresholds.humidity.low,
            max: userConfig.thresholds.humidity.high
          },
          brightness: {
            min: userConfig.thresholds.brightness.low,
            max: userConfig.thresholds.brightness.high
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy ngưỡng từ API:", error);
    }
  };

  const saveThresholds = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser?._id;
      const token = localStorage.getItem('token')
      if (!userId) return;

      await axios.put(`http://localhost:8080/config`, {
        user_id: userId,
        thresholds: {
          temperature: {
            low: thresholds.temperature.min,
            high: thresholds.temperature.max
          },
          humidity: {
            low: thresholds.humidity.min,
            high: thresholds.humidity.max
          },
          brightness: {
            low: thresholds.brightness.min,
            high: thresholds.brightness.max
          }
        },
      },
        {
          headers:
          {
            Authorization: `Bearer ${token}`
          },
        }
      );

      setCommandFeedback({
        command: 'settings',
        result: 'Đã lưu cài đặt ngưỡng',
        timestamp: new Date()
      });
    } catch (error) {
      console.error("Lỗi khi lưu ngưỡng:", error);
      setCommandFeedback({
        command: 'settings',
        result: 'Lỗi khi lưu cài đặt ngưỡng',
        timestamp: new Date()
      });
    }
  };
  const fetchSensorWarnings = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const userId = currentUser?._id;

      if (!userId) return;

      const [tempRes, humidRes, brightRes] = await Promise.all([
        axios.get(`http://localhost:8080/sensors/temperature/status?user_id=${userId}`),
        axios.get(`http://localhost:8080/sensors/humidity/status?user_id=${userId}`),
        axios.get(`http://localhost:8080/sensors/bright/status?user_id=${userId}`)
      ]);

      const newNotifications = [];

      if (tempRes.data.isOverThreshold) {
        newNotifications.push({
          message: tempRes.data.msg,
          timestamp: new Date(),
          type: 'temperature',
          read: false
        });
      }
      if (humidRes.data.isOverThreshold) {
        newNotifications.push({
          message: humidRes.data.msg,
          timestamp: new Date(),
          type: 'humidity',
          read: false
        });
      }
      if (brightRes.data.isOverThreshold) {
        newNotifications.push({
          message: brightRes.data.msg,
          timestamp: new Date(),
          type: 'brightness',
          read: false
        });
      }

      if (newNotifications.length > 0) {
        setNotifications(prev => [...newNotifications, ...prev]);
      }
    } catch (err) {
      console.error("Lỗi khi lấy cảnh báo từ API:", err);
    }
  };


  useEffect(() => {
    fetchSensorWarnings();
    const interval = setInterval(fetchSensorWarnings, 60000);
    return () => clearInterval(interval);
  }, [fetchSensorWarnings]); // Thêm dependency nếu dùng useCallback

  useEffect(() => {
    setActiveSlide(currentSlide);
  }, [currentSlide]);
  useEffect(() => {
    const newAlerts = [];

    if (temperature !== null) {
      if (temperature < thresholds.temperature.min) {
        newAlerts.push(`Nhiệt độ thấp (${temperature}°C < ${thresholds.temperature.min}°C)`);
      } else if (temperature > thresholds.temperature.max) {
        newAlerts.push(`Nhiệt độ cao (${temperature}°C > ${thresholds.temperature.max}°C)`);
      }
    }

    if (humidity !== null) {
      if (humidity < thresholds.humidity.min) {
        newAlerts.push(`Độ ẩm thấp (${humidity}% < ${thresholds.humidity.min}%)`);
      } else if (humidity > thresholds.humidity.max) {
        newAlerts.push(`Độ ẩm cao (${humidity}% > ${thresholds.humidity.max}%)`);
      }
    }

    if (brightness !== null) {
      if (brightness < thresholds.brightness.min) {
        newAlerts.push(`Ánh sáng yếu (${brightness}% < ${thresholds.brightness.min}%)`);
      } else if (brightness > thresholds.brightness.max) {
        newAlerts.push(`Ánh sáng mạnh (${brightness}% > ${thresholds.brightness.max}%)`);
      }
    }

    setAlerts(newAlerts);

    // Thêm vào lịch sử hệ thống nếu có cảnh báo mới
    if (newAlerts.length > 0) {
      const newEntries = newAlerts.map(alert => ({
        timestamp: new Date(),
        event: `Cảnh báo: ${alert}`,
        type: 'alert'
      }));
      setSystemHistory(prev => [...newEntries, ...prev.slice(0, 99)]);
    }
  }, [temperature, humidity, brightness, thresholds]);
  useEffect(() => {
    let timer;
    if (activeSlide === 1) {
      timer = setInterval(() => {
        timeRef.current = new Date();
        setDisplayTime(format(timeRef.current, 'HH:mm:ss'));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSlide]);
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDashboardState(stateToSave);
    }, 1000);
    return () => clearTimeout(timer);
  }, [stateToSave]);
  useEffect(() => {
    return () => {
      // Lưu state cuối cùng trước khi unmount
      const stateToSave = {
        ledStatus,
        currentDate: currentDate.getTime(),
        fanStatus,
        fanSpeed,
        darkMode,
        temperature,
        humidity,
        brightness,
        currentSlide,
        doorStatus,
        fanLevel,
        notes,
        selectedDate: selectedDate?.getTime(),
        systemHistory,
        detectionHistory,
        sensorDataHistory
      };
      saveDashboardState(stateToSave);

      // Dừng voice recognition nếu đang chạy
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Trình duyệt không hỗ trợ Web Speech API');
      return;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'vi-VN';

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        handleVoiceCommand(finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Lỗi nhận dạng giọng nói:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        recognitionRef.current.start();
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);
  useEffect(() => {
    const newEntry = {
      timestamp: new Date(),
      event: `Đèn ${ledStatus ? 'bật' : 'tắt'}`,
      type: 'device'
    };
    setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);

    // Cập nhật biểu đồ hoạt động
    if (ledStatus) {
      setActivityChartData(prev => {
        const newData = [...prev.datasets[0].data];
        newData[0] += 1;
        return {
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        };
      });
    }
  }, [ledStatus]);

  useEffect(() => {
    const newEntry = {
      timestamp: new Date(),
      event: `Quạt ${fanStatus ? 'bật' : 'tắt'}`,
      type: 'device'
    };
    setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);

    if (fanStatus) {
      setActivityChartData(prev => {
        const newData = [...prev.datasets[0].data];
        newData[1] += 1;
        return {
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        };
      });
    }
  }, [fanStatus]);

  useEffect(() => {
    const newEntry = {
      timestamp: new Date(),
      event: `Cửa ${doorStatus ? 'mở' : 'đóng'}`,
      type: 'device'
    };
    setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);

    if (doorStatus) {
      setActivityChartData(prev => {
        const newData = [...prev.datasets[0].data];
        newData[2] += 1;
        return {
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: newData
          }]
        };
      });
    }
  }, [doorStatus]);
  useEffect(() => {
    if (temperature !== null) {
      const newEntry = {
        timestamp: new Date(),
        value: temperature,
        type: 'temperature'
      };
      setSensorDataHistory(prev => ({
        ...prev,
        temperature: [newEntry, ...prev.temperature.slice(0, 99)]
      }));

      // Cập nhật biểu đồ
      setChartData(prev => {
        const now = format(new Date(), 'HH:mm');
        return {
          ...prev,
          labels: [now, ...prev.labels.slice(0, 11)],
          datasets: prev.datasets.map((dataset, idx) => {
            if (idx === 0) {
              return {
                ...dataset,
                data: [temperature, ...dataset.data.slice(0, 11)]
              };
            }
            return dataset;
          })
        };
      });
    }
  }, [temperature]);

  useEffect(() => {
    if (humidity !== null) {
      const newEntry = {
        timestamp: new Date(),
        value: humidity,
        type: 'humidity'
      };
      setSensorDataHistory(prev => ({
        ...prev,
        humidity: [newEntry, ...prev.humidity.slice(0, 99)]
      }));

      // Cập nhật biểu đồ
      setChartData(prev => ({
        ...prev,
        datasets: prev.datasets.map((dataset, idx) => {
          if (idx === 1) {
            return {
              ...dataset,
              data: [humidity, ...dataset.data.slice(0, 11)]
            };
          }
          return dataset;
        })
      }));
    }
  }, [humidity]);

  useEffect(() => {
    if (brightness !== null) {
      const newEntry = {
        timestamp: new Date(),
        value: brightness,
        type: 'brightness'
      };
      setSensorDataHistory(prev => ({
        ...prev,
        brightness: [newEntry, ...prev.brightness.slice(0, 99)]
      }));

      // Cập nhật biểu đồ
      setChartData(prev => ({
        ...prev,
        datasets: prev.datasets.map((dataset, idx) => {
          if (idx === 2) {
            return {
              ...dataset,
              data: [brightness, ...dataset.data.slice(0, 11)]
            };
          }
          return dataset;
        })
      }));
    }
  }, [brightness]);
  useEffect(() => {
    if (ledStatus) {
      const interval = setInterval(() => {
        // 30% khả năng phát hiện người
        if (Math.random() < 0.3) {
          const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
          const newDetection = {
            timestamp: new Date(),
            confidence,
            image: `https://picsum.photos/200/300?random=${Math.floor(Math.random() * 1000)}`
          };
          setDetectionHistory(prev => [newDetection, ...prev.slice(0, 9)]);

          // Thêm vào lịch sử hệ thống
          const newEntry = {
            timestamp: new Date(),
            event: `Camera phát hiện người (${confidence}%)`,
            type: 'camera'
          };
          setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);
        }
      }, 10000); // Kiểm tra mỗi 10 giây

      return () => clearInterval(interval);
    }
  }, [ledStatus]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tempRes, humidityRes, brightnessRes] = await Promise.all([
          axios.get(API_URL_TEMP),
          axios.get(API_URL_HUMIDITY),
          axios.get(API_URL_BRIGHTNESS)
        ]);

        const now = new Date();
        const timeLabel = format(now, 'HH:mm:ss');

        if (tempRes.data.length > 0) {
          const latestTemperature = parseFloat(tempRes.data[0].value);
          if (latestTemperature !== temperature) {
            setTemperature(latestTemperature);
            setSensorDataHistory(prev => ({
              ...prev,
              temperature: [...prev.temperature.slice(-11), { value: latestTemperature, time: now }]
            }));
          }
        }

        if (humidityRes.data.length > 0) {
          const latestHumidity = parseFloat(humidityRes.data[0].value);
          if (latestHumidity !== humidity) {
            setHumidity(latestHumidity);
            setSensorDataHistory(prev => ({
              ...prev,
              humidity: [...prev.humidity.slice(-11), { value: latestHumidity, time: now }]
            }));
          }
        }

        if (brightnessRes.data.length > 0) {
          const latestBrightness = parseFloat(brightnessRes.data[0].value);
          if (latestBrightness !== brightness) {
            setBrightness(latestBrightness);
            setSensorDataHistory(prev => ({
              ...prev,
              brightness: [...prev.brightness.slice(-11), { value: latestBrightness, time: now }]
            }));
          }
        }

        // Cập nhật biểu đồ
        setChartData(prev => {
          const timeLabels = sensorDataHistory.temperature.map(item => format(item.time, 'HH:mm:ss'));

          return {
            labels: timeLabels,
            datasets: [
              {
                ...prev.datasets[0],
                data: sensorDataHistory.temperature.map(item => item.value)
              },
              {
                ...prev.datasets[1],
                data: sensorDataHistory.humidity.map(item => item.value)
              },
              {
                ...prev.datasets[2],
                data: sensorDataHistory.brightness.map(item => item.value)
              }
            ]
          };
        });

      } catch (error) {
        console.error('Error fetching sensor data:', error);
      }
    };
  }, [temperature, humidity, brightness]);

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
  useEffect(() => {
    const savedNotes = localStorage.getItem('calendarNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse saved notes', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarNotes', JSON.stringify(notes));
  }, [notes]);
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  const toggleLED = useCallback(async () => {
    const newStatus = !ledStatus;
    setLedStatus(newStatus);

    const newEntry = {
      timestamp: new Date(),
      event: `Đèn ${newStatus ? 'bật' : 'tắt'}`,
      type: 'device'
    };
    setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);

    try {
      await axios.post("http://localhost:8080/led/update-status", {
        status: newStatus ? '1' : '0'
      });
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu điều khiển LED:', error);
    }
  }, [ledStatus]);


  const toggleFan = useCallback(async (forceStatus = null) => {
    const newStatus = forceStatus !== null ? forceStatus : !fanStatus;
    setFanStatus(newStatus);

    const newEntry = {
      timestamp: new Date(),
      event: `Quạt ${newStatus ? 'bật' : 'tắt'}`,
      type: 'device'
    };
    setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);

    try {
      await axios.post("http://localhost:8080/fan/update-status", {
        status: newStatus ? "ON" : "OFF"
      });
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu điều khiển quạt:', error);
    }
  }, [fanStatus]);


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

  const handleVoiceCommand = async (command) => {
  const normalizedCommand = command.toLowerCase().trim();
  let actionTaken = false;
  let feedbackMessage = '';
  let shouldUseBackend = true;
  let device = '';
  let deviceStatus = '';

  try {
    // Thử gửi lệnh đến backend trước
    if (shouldUseBackend) {
      const response = await axios.post('http://localhost:8080/voice/update-status', {
        status: normalizedCommand
      }, {
        timeout: 3000 // Timeout sau 3 giây nếu không có phản hồi
      });

      if (response.data.success) {
        feedbackMessage = response.data.message || 'Lệnh đã được thực hiện';
        actionTaken = true;
        device = response.data.device;
        deviceStatus = response.data.deviceStatus;
        
        // Cập nhật trạng thái thiết bị dựa trên phản hồi từ backend
        switch (device) {
          case 'led':
            setLedStatus(deviceStatus === '1' || deviceStatus === 'ON');
            break;
          case 'fan':
            setFanStatus(deviceStatus === 'ON');
            if (response.data.speedLevel) {
              setFanLevel(response.data.speedLevel);
            }
            break;
          case 'door':
            setDoorStatus(deviceStatus === 'OPEN');
            // Tự động đóng cửa sau 5 giây nếu là lệnh mở
            if (deviceStatus === 'OPEN') {
              setTimeout(() => {
                setDoorStatus(false);
                setCommandFeedback({
                  command: 'auto',
                  result: 'Cửa đã tự động đóng',
                  timestamp: new Date()
                });
              }, 5000);
            }
            break;
        }
        return; // Thoát nếu backend xử lý thành công
      }
    }
  } catch (error) {
    console.error('Lỗi kết nối đến server:', error);
    shouldUseBackend = false; // Chuyển sang chế độ offline
    feedbackMessage = 'Đang sử dụng điều khiển cục bộ';
  }

  // Xử lý cục bộ nếu không có kết nối đến backend hoặc backend không xử lý được
  if (!actionTaken) {
    // Điều khiển đèn
    if (normalizedCommand.includes('bật đèn') || 
        normalizedCommand.includes('bật đèn led') || 
        normalizedCommand.includes('bật đèn điện')) {
      if (!ledStatus) {
        await toggleLED();
        feedbackMessage = 'Đã bật đèn';
        actionTaken = true;
        device = 'led';
        deviceStatus = 'ON';
      } else {
        feedbackMessage = 'Đèn đã được bật từ trước';
      }
    } 
    else if (normalizedCommand.includes('tắt đèn') || 
             normalizedCommand.includes('tắt đèn led') || 
             normalizedCommand.includes('tắt đèn điện')) {
      if (ledStatus) {
        await toggleLED();
        feedbackMessage = 'Đã tắt đèn';
        actionTaken = true;
        device = 'led';
        deviceStatus = 'OFF';
      } else {
        feedbackMessage = 'Đèn đã được tắt từ trước';
      }
    }
    
    // Điều khiển quạt
    else if (normalizedCommand.includes('bật quạt') || 
             normalizedCommand.includes('mở quạt')) {
      if (!fanStatus) {
        await toggleFan(true);
        feedbackMessage = 'Đã bật quạt';
        actionTaken = true;
        device = 'fan';
        deviceStatus = 'ON';
      } else {
        feedbackMessage = 'Quạt đã được bật từ trước';
      }
    } 
    else if (normalizedCommand.includes('tắt quạt') || 
             normalizedCommand.includes('đóng quạt')) {
      if (fanStatus) {
        await toggleFan(false);
        feedbackMessage = 'Đã tắt quạt';
        actionTaken = true;
        device = 'fan';
        deviceStatus = 'OFF';
      } else {
        feedbackMessage = 'Quạt đã được tắt từ trước';
      }
    }
    
    // Điều chỉnh tốc độ quạt
    else if (normalizedCommand.match(/quạt mức (\d)/) || 
             normalizedCommand.match(/chỉnh quạt mức (\d)/)) {
      const fanLevelMatch = normalizedCommand.match(/(\d)/);
      const level = parseInt(fanLevelMatch[1]);
      if (level >= 1 && level <= 4) {
        setFanLevel(level);
        if (!fanStatus) await toggleFan(true);
        feedbackMessage = `Đã đặt quạt mức ${level}`;
        actionTaken = true;
        device = 'fan';
        deviceStatus = 'ON';
      } else {
        feedbackMessage = 'Mức quạt phải từ 1 đến 4';
      }
    }
    
    // Điều khiển cửa
    else if (normalizedCommand.includes('mở cửa') || 
             normalizedCommand.includes('mở cổng')) {
      if (!doorStatus) {
        setDoorStatus(true);
        feedbackMessage = 'Đã mở cửa (tự động đóng sau 5 giây)';
        actionTaken = true;
        device = 'door';
        deviceStatus = 'OPEN';
        setTimeout(() => {
          setDoorStatus(false);
          setCommandFeedback({
            command: 'auto',
            result: 'Cửa đã tự động đóng',
            timestamp: new Date()
          });
        }, 5000);
      } else {
        feedbackMessage = 'Cửa đã được mở từ trước';
      }
    } 
    else if (normalizedCommand.includes('đóng cửa') || 
             normalizedCommand.includes('đóng cổng')) {
      if (doorStatus) {
        setDoorStatus(false);
        feedbackMessage = 'Đã đóng cửa';
        actionTaken = true;
        device = 'door';
        deviceStatus = 'CLOSE';
      } else {
        feedbackMessage = 'Cửa đã được đóng từ trước';
      }
    }
    
    // Điều khiển camera
    else if (normalizedCommand.includes('bật camera') || 
             normalizedCommand.includes('mở camera') || 
             normalizedCommand.includes('bật ghi hình')) {
      if (!ledStatus) {
        await toggleLED();
        feedbackMessage = 'Đã bật camera giám sát';
        actionTaken = true;
        device = 'camera';
        deviceStatus = 'ON';
      } else {
        feedbackMessage = 'Camera đã được bật từ trước';
      }
    } 
    else if (normalizedCommand.includes('tắt camera') || 
             normalizedCommand.includes('đóng camera') || 
             normalizedCommand.includes('tắt ghi hình')) {
      if (ledStatus) {
        await toggleLED();
        feedbackMessage = 'Đã tắt camera giám sát';
        actionTaken = true;
        device = 'camera';
        deviceStatus = 'OFF';
      } else {
        feedbackMessage = 'Camera đã được tắt từ trước';
      }
    }
    
    // Lệnh tổng hợp
    else if (normalizedCommand.includes('bật tất cả') || 
             normalizedCommand.includes('mở tất cả')) {
      if (!ledStatus) await toggleLED();
      if (!fanStatus) await toggleFan(true);
      feedbackMessage = 'Đã bật tất cả thiết bị';
      actionTaken = true;
      device = 'all';
      deviceStatus = 'ON';
    } 
    else if (normalizedCommand.includes('tắt tất cả') || 
             normalizedCommand.includes('đóng tất cả')) {
      if (ledStatus) await toggleLED();
      if (fanStatus) await toggleFan(false);
      if (doorStatus) setDoorStatus(false);
      feedbackMessage = 'Đã tắt tất cả thiết bị';
      actionTaken = true;
      device = 'all';
      deviceStatus = 'OFF';
    }
    
    // Lệnh không nhận diện được
    else {
      feedbackMessage = 'Không nhận diện được lệnh. Vui lòng thử lại.';
    }
  }

  // Ghi log và hiển thị phản hồi
  if (actionTaken || feedbackMessage) {
    const newEntry = {
      timestamp: new Date(),
      event: `Lệnh thoại: "${normalizedCommand}" - ${feedbackMessage}`,
      type: 'voice',
      device,
      deviceStatus
    };
    setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);
    
    setCommandFeedback({
      command: normalizedCommand,
      result: feedbackMessage,
      timestamp: new Date()
    });
  }

  // Tự động ẩn feedback sau 3 giây
  setTimeout(() => setCommandFeedback(null), 3000);
};
// useEffect(() => {
//   // Kết nối MQTT để nhận cập nhật trạng thái thiết bị
//   const client = mqtt.connect(process.env.REACT_APP_MQTT_BROKER, {
//     username: process.env.REACT_APP_ADAFRUIT_USERNAME,
//     password: process.env.REACT_APP_ADAFRUIT_KEY
//   });

//   client.on('connect', () => {
//     console.log('Connected to MQTT broker');
    
//     // Subscribe các feed điều khiển thiết bị
//     client.subscribe(`${process.env.REACT_APP_ADAFRUIT_USERNAME}/feeds/led-control`);
//     client.subscribe(`${process.env.REACT_APP_ADAFRUIT_USERNAME}/feeds/fan-control`);
//     client.subscribe(`${process.env.REACT_APP_ADAFRUIT_USERNAME}/feeds/door-control`);
//   });

//   client.on('message', (topic, message) => {
//     const feed = topic.split('/').pop();
//     const value = message.toString();
    
//     // Cập nhật trạng thái dựa trên feed và giá trị nhận được
//     switch(feed) {
//       case 'led-control':
//         setLedStatus(value === '1');
//         break;
//       case 'fan-control':
//         setFanStatus(value === 'ON');
//         break;
//       case 'door-control':
//         setDoorStatus(value === 'OPEN');
//         break;
//     }
    
//     // Ghi log hệ thống
//     const deviceName = {
//       'led-control': 'Đèn',
//       'fan-control': 'Quạt',
//       'door-control': 'Cửa'
//     }[feed];
    
//     const statusText = {
//       'led-control': value === '1' ? 'bật' : 'tắt',
//       'fan-control': value === 'ON' ? 'bật' : 'tắt',
//       'door-control': value === 'OPEN' ? 'mở' : 'đóng'
//     }[feed];
    
//     setSystemHistory(prev => [{
//       timestamp: new Date(),
//       event: `${deviceName} đã ${statusText} từ xa`,
//       type: 'remote'
//     }, ...prev.slice(0, 99)]);
//   });

//   return () => {
//     client.end();
//   };
// }, []);
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
    setCurrentSlide((prev) => (prev === 5 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? 5 : prev - 1));
  };
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 10000);

  //   return () => clearInterval(timer);
  // }, []);

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
  const FanControl = () => {
    const handleFanToggle = async () => {
      const newStatus = !fanStatus;
      try {
        await axios.post("http://localhost:8080/fan/update-status", {
          status: newStatus ? "ON" : "OFF"
        });
        setFanStatus(newStatus);
      } catch (error) {
        console.error('Lỗi khi điều khiển quạt:', error);
      }
    };

    return (
      <div style={{ ...cardStyle, backgroundColor: darkMode ? "#2f3542" : "white" }}>
        <div style={sensorTitleStyle}>ĐIỀU KHIỂN QUẠT</div>

        {/* Nút bật/tắt */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '20px 0'
        }}>
          <button
            onClick={handleFanToggle}
            style={{
              padding: '12px 24px',
              backgroundColor: fanStatus ? '#2ed573' : '#ff4757',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {fanStatus ? 'TẮT QUẠT' : 'BẬT QUẠT'}
          </button>
        </div>

        {/* Điều chỉnh tốc độ khi quạt bật */}
        {fanStatus && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              Tốc độ quạt: <strong>Mức {fanLevel}</strong>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px'
            }}>
              {[1, 2, 3, 4].map(level => (
                <button
                  key={level}
                  onClick={() => setFanLevel(level)}
                  style={{
                    padding: '10px',
                    backgroundColor: fanLevel === level
                      ? '#3498db'
                      : darkMode ? '#57606f' : '#f1f2f6',
                    color: fanLevel === level ? 'white' : darkMode ? 'white' : '#2f3542',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
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
  };
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
  const ThresholdSettings = () => (
    <div style={{ ...cardStyle, backgroundColor: darkMode ? "#2f3542" : "white", padding: '20px' }}>
      <h3 style={{ ...sensorTitleStyle, marginBottom: '20px' }}>THIẾT LẬP NGƯỠNG</h3>

      {/* Nhiệt độ */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          color: darkMode ? '#64ffda' : '#0077b6',
          marginBottom: '10px',
          fontSize: '16px'
        }}>Nhiệt độ (°C)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: darkMode ? '#a4b0be' : '#57606f',
              fontSize: '14px'
            }}>Tối thiểu</label>
            <input
              type="number"
              value={thresholds.temperature.min}
              onChange={(e) => setThresholds(prev => ({
                ...prev,
                temperature: { ...prev.temperature, min: Math.max(0, Number(e.target.value)) }
              }))}
              min="0"
              max={thresholds.temperature.max - 1}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
                color: darkMode ? 'white' : '#2f3542'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: darkMode ? '#a4b0be' : '#57606f',
              fontSize: '14px'
            }}>Tối đa</label>
            <input
              type="number"
              value={thresholds.temperature.max}
              onChange={(e) => setThresholds(prev => ({
                ...prev,
                temperature: { ...prev.temperature, max: Math.min(50, Number(e.target.value)) }
              }))}
              min={thresholds.temperature.min + 1}
              max="50"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
                color: darkMode ? 'white' : '#2f3542'
              }}
            />
          </div>
        </div>
      </div>

      {/* Độ ẩm */}
      <div style={{ marginBottom: '25px' }}>
        <h4 style={{
          color: darkMode ? '#64ffda' : '#0077b6',
          marginBottom: '10px',
          fontSize: '16px'
        }}>Độ ẩm (%)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: darkMode ? '#a4b0be' : '#57606f',
              fontSize: '14px'
            }}>Tối thiểu</label>
            <input
              type="number"
              value={thresholds.humidity.min}
              onChange={(e) => setThresholds(prev => ({
                ...prev,
                humidity: { ...prev.humidity, min: Math.max(0, Number(e.target.value)) }
              }))}
              min="0"
              max={thresholds.humidity.max - 1}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
                color: darkMode ? 'white' : '#2f3542'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: darkMode ? '#a4b0be' : '#57606f',
              fontSize: '14px'
            }}>Tối đa</label>
            <input
              type="number"
              value={thresholds.humidity.max}
              onChange={(e) => setThresholds(prev => ({
                ...prev,
                humidity: { ...prev.humidity, max: Math.min(100, Number(e.target.value)) }
              }))}
              min={thresholds.humidity.min + 1}
              max="100"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
                color: darkMode ? 'white' : '#2f3542'
              }}
            />
          </div>
        </div>
      </div>

      {/* Ánh sáng */}
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{
          color: darkMode ? '#64ffda' : '#0077b6',
          marginBottom: '10px',
          fontSize: '16px'
        }}>Ánh sáng (%)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: darkMode ? '#a4b0be' : '#57606f',
              fontSize: '14px'
            }}>Tối thiểu</label>
            <input
              type="number"
              value={thresholds.brightness.min}
              onChange={(e) => setThresholds(prev => ({
                ...prev,
                brightness: { ...prev.brightness, min: Math.max(0, Number(e.target.value)) }
              }))}
              min="0"
              max={thresholds.brightness.max - 1}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
                color: darkMode ? 'white' : '#2f3542'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: darkMode ? '#a4b0be' : '#57606f',
              fontSize: '14px'
            }}>Tối đa</label>
            <input
              type="number"
              value={thresholds.brightness.max}
              onChange={(e) => setThresholds(prev => ({
                ...prev,
                brightness: { ...prev.brightness, max: Math.min(100, Number(e.target.value)) }
              }))}
              min={thresholds.brightness.min + 1}
              max="100"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
                color: darkMode ? 'white' : '#2f3542'
              }}
            />
          </div>
        </div>
      </div>

      {/* Nút lưu cài đặt */}
      <button
        onClick={saveThresholds}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#2ed573',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: 'pointer',
          marginTop: '10px',
          transition: 'all 0.3s ease',
          ':hover': {
            backgroundColor: '#27ae60'
          }
        }}
      >
        LƯU CÀI ĐẶT
      </button>
    </div>

  );
  useEffect(() => {
    fetchThresholds();
    fetchSensorWarnings();
  }, []);
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
      {alerts.length > 0 && (
        <div style={{
          backgroundColor: "#ff6b6b",
          color: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontWeight: "bold",
          maxWidth: "1000px",
          width: "100%",
          textAlign: "center"
        }}>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{ marginBottom: "5px" }}>⚠️ {alert}</div>
          ))}
        </div>
      )}

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
            name="HỆ THỐNG PHƠI ĐỒ"
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
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
      const timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000); // Cập nhật mỗi giây

      return () => clearInterval(timer);
    }, []);
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
              HỆ THỐNG PHƠI ĐỒ
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
        <div style={{
          ...cardStyle,
          backgroundColor: darkMode ? '#2f3542' : 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          gridColumn: '1 / -1'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <span style={{
              fontSize: '24px',
              marginRight: '10px'
            }}>🎤</span>
            <h3 style={{
              ...sensorTitleStyle,
              margin: '0',
              fontSize: '20px'
            }}>ĐIỀU KHIỂN BẰNG GIỌNG NÓI</h3>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '0 20px'
          }}>
            <button
              onClick={toggleListening}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: isListening ? '#ff4757' : '#2ed573',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                ':hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              {isListening ? (
                <>
                  <div style={{
                    fontSize: '36px',
                    marginBottom: '5px',
                    animation: 'pulse 1.5s infinite'
                  }}>🎤</div>
                  <div>ĐANG NGHE...</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '36px', marginBottom: '5px' }}>🎤</div>
                  <div>BẤM ĐỂ NÓI</div>
                </>
              )}
            </button>

            <div style={{
              width: '100%',
              minHeight: '60px',
              padding: '15px',
              backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {transcript ? (
                <div style={{ color: darkMode ? 'white' : '#2f3542' }}>{transcript}</div>
              ) : (
                <div style={{ color: darkMode ? '#a4b0be' : '#57606f' }}>
                  {isListening ? 'Đang nghe... Hãy ra lệnh' : 'Nhấn nút và ra lệnh bằng giọng nói'}
                </div>
              )}
            </div>

            <div style={{
              width: '100%',
              backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px'
            }}>
              <h4 style={{
                marginTop: '0',
                marginBottom: '10px',
                color: darkMode ? 'white' : '#2f3542',
                textAlign: 'center'
              }}>CÁC LỆNH HỖ TRỢ</h4>
              <ul style={{
                paddingLeft: '20px',
                margin: '0',
                color: darkMode ? '#a4b0be' : '#57606f',
                fontSize: '14px'
              }}>
                <li>"Bật đèn" - Bật đèn LED</li>
                <li>"Tắt đèn" - Tắt đèn LED</li>
                <li>"Bật quạt" - Bật quạt</li>
                <li>"Tắt quạt" - Tắt quạt</li>
                <li>"Quạt mức 1" đến "Quạt mức 4" - Đặt tốc độ quạt</li>
                <li>"Mở cửa" - Mở cửa (tự động đóng sau 5 giây)</li>
                <li>"Đóng cửa" - Đóng cửa ngay lập tức</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const HistorySlide = () => (
    <div style={{
      ...slideStyle,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '30px 20px',
      overflowY: 'auto'
    }}>
      <h2 style={{
        color: darkMode ? 'white' : '#2f3542',
        margin: '0 0 30px 0',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '600',
        letterSpacing: '1px'
      }}>LỊCH SỬ HOẠT ĐỘNG</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        width: '100%',
        maxWidth: '1200px'
      }}>
        {/* Biểu đồ cảm biến */}
        <div style={{
          ...cardStyle,
          backgroundColor: darkMode ? '#2f3542' : 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: darkMode ? 'white' : '#2f3542',
            marginTop: '0',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '20px'
          }}>BIỂU ĐỒ CẢM BIẾN THEO THỜI GIAN</h3>

          <div style={{ height: '300px' }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Thời gian'
                    }
                  },
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Nhiệt độ (°C)'
                    }
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Độ ẩm/Ánh sáng (%)'
                    },
                    grid: {
                      drawOnChartArea: false,
                    },
                  },
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y;
                          if (context.datasetIndex === 0) {
                            label += '°C';
                          } else {
                            label += '%';
                          }
                        }
                        return label;
                      }
                    }
                  },
                  legend: {
                    position: 'top',
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Biểu đồ hoạt động */}
        <div style={{
          ...cardStyle,
          backgroundColor: darkMode ? '#2f3542' : 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: darkMode ? 'white' : '#2f3542',
            marginTop: '0',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '20px'
          }}>HOẠT ĐỘNG THIẾT BỊ</h3>

          <div style={{ height: '300px' }}>
            <Bar
              data={activityChartData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Số lần bật'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Lịch sử hoạt động */}
        <div style={{
          ...cardStyle,
          backgroundColor: darkMode ? '#2f3542' : 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
          gridColumn: '1 / -1'
        }}>
          <h3 style={{
            color: darkMode ? 'white' : '#2f3542',
            marginTop: '0',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '20px'
          }}>LỊCH SỬ HỆ THỐNG</h3>

          <div style={{
            height: '300px',
            overflowY: 'auto',
            padding: '10px',
            backgroundColor: darkMode ? '#3d4852' : '#f1f2f6',
            borderRadius: '8px'
          }}>
            {systemHistory.length > 0 ? (
              systemHistory.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    borderBottom: `1px solid ${darkMode ? '#57606f' : '#dfe4ea'}`,
                    fontSize: '14px'
                  }}
                >
                  <span style={{ color: darkMode ? '#a4b0be' : '#57606f' }}>
                    {format(new Date(entry.timestamp), 'HH:mm:ss')}
                  </span>
                  <span style={{
                    color: entry.type === 'camera' ? '#ff4757' :
                      entry.type === 'device' ? '#2ed573' :
                        darkMode ? 'white' : '#2f3542'
                  }}>
                    {entry.event}
                  </span>
                </div>
              ))
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: darkMode ? '#a4b0be' : '#57606f'
              }}>
                Chưa có dữ liệu lịch sử
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  const CameraSlide = () => (
    <div style={{
      ...slideStyle,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <h2 style={{
        color: darkMode ? 'white' : '#2f3542',
        marginBottom: '30px',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: '600',
        letterSpacing: '1px'
      }}>CAMERA GIÁM SÁT</h2>

      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        aspectRatio: '16/9',
        backgroundColor: darkMode ? '#57606f' : '#dfe4ea',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        marginBottom: '30px'
      }}>
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
        <div style={{
          marginTop: '30px',
          width: '100%',
          maxWidth: '800px',
          backgroundColor: darkMode ? '#2f3542' : 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{
            color: darkMode ? 'white' : '#2f3542',
            marginTop: '0',
            marginBottom: '15px',
            fontSize: '18px'
          }}>PHÁT HIỆN NGƯỜI</h3>

          {detectionHistory.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '15px'
            }}>
              {detectionHistory.map((detection, index) => (
                <div key={index} style={{
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}>
                  <img
                    src={detection.image}
                    alt={`Detection ${index}`}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: '5px',
                    fontSize: '12px',
                    textAlign: 'center'
                  }}>
                    {format(new Date(detection.timestamp), 'HH:mm:ss')} - {detection.confidence}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: darkMode ? '#a4b0be' : '#57606f'
            }}>
              Chưa có phát hiện nào
            </div>
          )}
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
        notifications={notifications || []}
        onDarkModeToggle={useCallback(() => {
          const newMode = !darkMode;
          setDarkMode(newMode);
          const newEntry = {
            timestamp: new Date(),
            event: `Chuyển sang chế độ ${newMode ? 'tối' : 'sáng'}`,
            type: 'system'
          };
          setSystemHistory(prev => [newEntry, ...prev.slice(0, 99)]);
        }, [darkMode])}
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
          <HistorySlide />
          <ThresholdSettings />
        </div>

        <div style={indicatorContainerStyle}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
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

      {/* Feedback popup */}
      {commandFeedback && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: commandFeedback.result.includes('Không nhận diện') ? '#ff4757' : '#2ed573',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          animation: 'fadeInOut 3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ fontWeight: 'bold' }}>{commandFeedback.result}</div>
          {commandFeedback.command !== 'auto' && (
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              {format(commandFeedback.timestamp, 'HH:mm:ss')}
            </div>
          )}
        </div>
      )}

      {/* CSS animations */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
            10% { opacity: 1; transform: translateX(-50%) translateY(0); }
            90% { opacity: 1; transform: translateX(-50%) translateY(0); }
            100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
          }
        `}
      </style>
    </div>
  );
};

export default Dashboard;
