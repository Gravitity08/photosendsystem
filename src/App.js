import React, { useState } from 'react';
import logo from './assets/logo.png';

// 메인 App 컴포넌트
const App = () => {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deceasedName, setDeceasedName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [showConsentConfirm, setShowConsentConfirm] = useState(false); // 전송 동의 단계 여부
  const handleRemoveFile = (fileNameToRemove) => {
    const updatedFiles = selectedFiles.filter(file => file.name !== fileNameToRemove);
    setSelectedFiles(updatedFiles);
    validateForm(customerName, phoneNumber, deceasedName, updatedFiles);
  };
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;


  const validateForm = (currentCustomerName, currentPhoneNumber, currentDeceasedName, currentSelectedFiles) => {
    const isValid =
      currentCustomerName.trim() !== '' &&
      currentPhoneNumber.trim() !== '' &&
      currentDeceasedName.trim() !== '' &&
      currentSelectedFiles.length > 0;
    setIsFormValid(isValid);
  };

  const handleInputChange = (e, setter) => {
    const newValue = e.target.value;
    setter(newValue); // ✅ 항상 먼저 상태 반영

    // 유효성 검사 경고는 따로 표시만 한다
    if (setter === setCustomerName || setter === setDeceasedName) {
      const nameRegex = /^[A-Za-z가-힣\s]+$/;
      if (newValue !== '' && !nameRegex.test(newValue)) {
        setMessage('이름은 한글과 영어만 입력 가능합니다.');
      } else {
        setMessage('');
      }
    }

    if (setter === setPhoneNumber) {
      const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
      if (newValue !== '' && !phoneRegex.test(newValue)) {
        setMessage('전화번호 형식이 올바르지 않습니다. 예: 010-1234-5678');
      } else {
        setMessage('');
      }
    }

    // validateForm
    validateForm(
      setter === setCustomerName ? newValue : customerName,
      setter === setPhoneNumber ? newValue : phoneNumber,
      setter === setDeceasedName ? newValue : deceasedName,
      selectedFiles
    );
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    // 🔁 기존 선택된 파일 + 새로 선택한 파일 병합
    const mergedFiles = [...selectedFiles, ...newFiles];

    // 🔍 1. 중복 제거 (이름 기준)
    const uniqueFiles = [];
    const seenNames = new Set();
    for (const file of mergedFiles) {
      if (!seenNames.has(file.name)) {
        seenNames.add(file.name);
        uniqueFiles.push(file);
      }
    }

    // 🔍 2. 개수 제한
    if (uniqueFiles.length > 100) {
      setMessage('파일은 최대 100개까지 업로드할 수 있습니다.');
      return;
    }

    // 🔍 3. 확장자 검사
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'zip'];
    const invalidFiles = uniqueFiles.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return !allowedExtensions.includes(ext);
    });
    if (invalidFiles.length > 0) {
      setMessage('JPG, PNG, ZIP 파일만 업로드 가능합니다.');
      return;
    }

    // 🔍 4. 총 용량 제한
    const totalSize = uniqueFiles.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 50 * 1024 * 1024) {
      setMessage('전체 파일 용량은 50MB를 초과할 수 없습니다.');
      return;
    }

    // ✅ 성공: 반영
    setSelectedFiles(uniqueFiles);
    setMessage('');
    validateForm(customerName, phoneNumber, deceasedName, uniqueFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    const currentIsValid =
      customerName.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      deceasedName.trim() !== '' &&
      selectedFiles.length > 0;

    if (!currentIsValid) {
      setMessage('모든 필수 정보와 파일을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setMessage('파일과 정보를 전송 중입니다...');

    try {
      // FormData 구성
      const formData = new FormData();
      formData.append('customerName', customerName);
      formData.append('phoneNumber', phoneNumber);
      formData.append('deceasedName', deceasedName);
      selectedFiles.forEach(file => formData.append('files', file));

      const response = await fetch("git push origin mainhttps://photosendsystem.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ 성공적으로 전송되었습니다!\n\n서버 메시지: ${result.message}`);
        // 폼 초기화
        setCustomerName('');
        setPhoneNumber('');
        setDeceasedName('');
        setSelectedFiles([]);
        setIsFormValid(false);
        setShowConsentConfirm(false);
      } else {
        setMessage(`❌ 전송 실패: ${result.message}`);
      }
    } finally {
      setIsLoading(false);
      setShowConsentConfirm(false); // 전송 동의 상태 초기화
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="로고" className="h-32" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">사진 접수 신청</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          직접 이메일로 전송을 원하시는 분은 아래 양식과 같이 <strong>geneforever001@gmail.com</strong>으로 보내주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customerName" className="block text-gray-700 text-sm font-semibold mb-2">
              고객 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="이름을 입력하세요"
              value={customerName}
              onChange={(e) => handleInputChange(e, setCustomerName)}
              required
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-semibold mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNumber"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="010-1234-5678"
              value={phoneNumber}
              onChange={(e) => handleInputChange(e, setPhoneNumber)}
              required
            />
          </div>

          <div>
            <label htmlFor="deceasedName" className="block text-gray-700 text-sm font-semibold mb-2">
              고인 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="deceasedName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="고인 이름을 입력하세요"
              value={deceasedName}
              onChange={(e) => handleInputChange(e, setDeceasedName)}
              required
            />
          </div>

          <div>
            <label htmlFor="photos" className="block text-gray-700 text-sm font-semibold mb-2">
              사진 파일 첨부 (여러 개 선택 가능)
            </label>
            <p className="text-xs text-gray-500 mb-1">
              업로드 가능 확장자: JPG, PNG, ZIP (최대 100개, 총 50MB 이하)
            </p>
            <input
              key={selectedFiles.length}
              type="file"
              id="photos"
              className="w-full text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              multiple
              accept=".jpg,.jpeg,.png,.zip"
              onChange={handleFileChange}
            />
            {selectedFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <p className="font-medium mb-1">선택된 파일:</p>
                <ul className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>
                        {file.name} - {(file.size / 1024 / 1024).toFixed(2)}MB
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(file.name)}
                        className="ml-2 text-red-500 hover:text-red-700 text-xs"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 파일 접수 버튼 (1차 클릭) */}
          {!showConsentConfirm && (
            <button
              type="button"
              onClick={() => setShowConsentConfirm(true)}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 ease-in-out
      ${isFormValid && !isLoading ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'}
    `}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? '접수 중...' : '파일 접수'}
            </button>
          )}

          {/* 전송 동의 확인 버튼 (2차 클릭) */}
          {showConsentConfirm && (
            <div className="space-y-3">
              <div className="text-sm text-gray-800 bg-yellow-100 border border-yellow-300 p-3 rounded-md">
                본인은 사진 및 정보를 전송하는 데 동의하며, 이후 절차에 대해 안내받는 것에 동의합니다.
              </div>
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition duration-200"
                disabled={isLoading}
              >
                전송 확인
              </button>
              <button
                type="button"
                onClick={() => setShowConsentConfirm(false)}
                className="w-full py-2 px-4 rounded-lg text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                취소
              </button>
            </div>
          )}
        </form>

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm whitespace-pre-wrap
              ${isLoading
                ? 'bg-blue-100 text-blue-800'
                : message.includes('성공적으로 접수')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'}`}
            role="alert"
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
