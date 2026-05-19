import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Users } from 'lucide-react'; 
import ErrorMessage from '../components/ErrorMessage';
import './Auth.css'; 

const SignUp = ({ showToast, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [emailLocal, setEmailLocal] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [domainSelect, setDomainSelect] = useState('');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [phoneFirst, setPhoneFirst] = useState('010'); 
  const [phoneMiddle, setPhoneMiddle] = useState('');
  const [phoneLast, setPhoneLast] = useState('');
  const [groupName, setGroupName] = useState('');

  const [errors, setErrors] = useState({ 
    email: '', password: '', passwordConfirm: '', phone: '', groupName: '' 
  });

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+~\-]{4,20}$/;

  const handleDomainChange = (e) => {
    const value = e.target.value;
    setDomainSelect(value);
    
    if (value === "") {
      setEmailDomain('');
    } else {
      setEmailDomain(value);
    }
    if (errors.email) setErrors({ ...errors, email: '' });
  };

  const handleSignUp = (e) => {
    e.preventDefault(); 
    
    let hasError = false;
    let newErrors = { email: '', password: '', passwordConfirm: '', phone: '', groupName: '' };

    const fullEmail = `${emailLocal.trim()}@${emailDomain.trim()}`;

    if (!emailRegex.test(fullEmail)) { // 🌟 fullEmail로 검사하도록 수정됨
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      hasError = true;
    }

    if (!passwordRegex.test(password)) {
      newErrors.password = '비밀번호는 영문, 숫자 조합 4~20자로 입력해주세요.';
      hasError = true;
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다.';
      hasError = true;
    }

    if (phoneFirst.length < 2 || phoneMiddle.length !== 4 || phoneLast.length !== 4) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
      hasError = true;
    }

    if (groupName.length < 2 || groupName.length > 20) {
      newErrors.groupName = '그룹명은 2자 이상 20자 이하로 입력해주세요.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const fullPhoneNumber = `${phoneFirst}-${phoneMiddle}-${phoneLast}`;
    const newUserData = {
      email: fullEmail,                  
      password: password,            
      phone_number: fullPhoneNumber, 
      group_name: groupName          
    };

    console.log("회원가입 요청 데이터:", newUserData); 

        if (setIsLoggedIn) {
      setIsLoggedIn(true); 
    }

    if (showToast) {
      showToast("회원가입 성공!🎉");
    }

    navigate('/account'); 
  };

  return (
    <div className="auth-container">
      <div className="top-section">
        <h1 className="layout-title">회원가입</h1>
        <p className="layout-description">우리 가족의 그룹을 생성합니다.</p>
      </div>
      
      <form onSubmit={handleSignUp} className="auth-form">

        {/* 이메일 */}
        <div className="form-field">
          <label>이메일</label>
          <div className="phone-input-group">
            <input 
              type="text" 
              placeholder="아이디" 
              value={emailLocal}
              onChange={(e) => {
                setEmailLocal(e.target.value.replace(/[^a-zA-Z0-9_-]/g, '')); 
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              className={`phone-input ${errors.email ? 'input-error' : ''}`}
              style={{ textAlign: 'left', paddingLeft: '15px' }} 
            />
            <span className="phone-separator">@</span>
            <input 
              type="text" 
              placeholder="도메인 입력" 
              value={emailDomain}
              onChange={(e) => {
                setEmailDomain(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              disabled={domainSelect !== ""} 
              className={`phone-input ${errors.email ? 'input-error' : ''}`}
              style={{ textAlign: 'left', paddingLeft: '15px' }}
            />
          </div>
          <select 
            value={domainSelect} 
            onChange={handleDomainChange}
            className="phone-input"
            style={{ width: '100%', marginTop: '8px', cursor: 'pointer', textAlign: 'left', paddingLeft: '15px' }}
          >
            <option value="">직접 입력</option>
            <option value="naver.com">naver.com</option>
            <option value="gmail.com">gmail.com</option>
            <option value="daum.net">daum.net</option>
            <option value="hanmail.net">hanmail.net</option>
            <option value="kakao.com">kakao.com</option>
          </select>
          <ErrorMessage message={errors.email} />
        </div>

        <div className="form-field">
          <label>비밀번호</label>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input 
              type="password" 
              placeholder="영문, 숫자 조합 4~20자" 
              value={password}
              onChange={(e) => {
                const newVal = e.target.value;
                setPassword(newVal);

                if (passwordConfirm.length > 0 && newVal !== passwordConfirm) {
                  setErrors(prev => ({ ...prev, password: '', passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
                } else if (newVal === passwordConfirm) {
                  setErrors(prev => ({ ...prev, password: '', passwordConfirm: '' }));
                } else {
                  setErrors(prev => ({ ...prev, password: '' }));
                }
              }}
              maxLength={20}
              className={errors.password ? 'input-error' : ''}
            />
          </div>
          <ErrorMessage message={errors.password} />
        </div>

        <div className="form-field">
          <label>비밀번호 확인</label>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input 
              type="password" 
              placeholder="비밀번호를 다시 입력해주세요" 
              value={passwordConfirm}
              onChange={(e) => {
                const newVal = e.target.value;
                setPasswordConfirm(newVal);
                if (newVal.length > 0 && password !== newVal) {
                  setErrors(prev => ({ ...prev, passwordConfirm: '비밀번호가 일치하지 않습니다.' }));
                } else {
                  setErrors(prev => ({ ...prev, passwordConfirm: '' }));
                }
              }}
              maxLength={20}
              className={errors.passwordConfirm ? 'input-error' : ''}
            />
          </div>
          <ErrorMessage message={errors.passwordConfirm} />
        </div>

        <div className="form-field">
          <label>전화번호</label>
          <div className="phone-input-group">
            <input 
              type="text" placeholder="010" maxLength={3} value={phoneFirst}
              onChange={(e) => {
                setPhoneFirst(e.target.value.replace(/[^0-9]/g, ''));
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`phone-input ${errors.phone ? 'input-error' : ''}`}
            />
            <span className="phone-separator">-</span>
            <input 
              type="text" placeholder="0000" maxLength={4} value={phoneMiddle}
              onChange={(e) => {
                setPhoneMiddle(e.target.value.replace(/[^0-9]/g, ''));
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`phone-input ${errors.phone ? 'input-error' : ''}`}
            />
            <span className="phone-separator">-</span>
            <input 
              type="text" placeholder="0000" maxLength={4} value={phoneLast}
              onChange={(e) => {
                setPhoneLast(e.target.value.replace(/[^0-9]/g, ''));
                if (errors.phone) setErrors({ ...errors, phone: '' });
              }}
              className={`phone-input ${errors.phone ? 'input-error' : ''}`}
            />
          </div>
          <ErrorMessage message={errors.phone} />
        </div>

        {/* 그룹명 */}
        <div className="form-field">
          <label>그룹명</label>
          <div className="input-with-icon">
            <Users className="input-icon" />
            <input 
              type="text" 
              placeholder="자유 형식 (2~20자)" 
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (errors.groupName) setErrors({ ...errors, groupName: '' });
              }}
              maxLength={20}
              className={errors.groupName ? 'input-error' : ''}
            />
          </div>
          <ErrorMessage message={errors.groupName} />
        </div>

        <button type="submit" className="main-button">
          가입하기
        </button>
      </form>

      <div className="bottom-links">
        <p className="signup-text">
          이미 계정이 있으신가요? <Link to="/login" className="accent-link">로그인</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;