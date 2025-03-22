import { useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(`로그인 실패: ${error.message}`);
    else alert('로그인 성공');
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(`회원가입 실패: ${error.message}`);
    else alert('회원가입 성공. 이메일을 확인하세요.');
  };

  return (
    <div className="flex flex-col gap-3 p-4 border rounded shadow-md">
      <input
        type="email"
        placeholder="이메일"
        className="border p-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        className="border p-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="bg-blue-500 text-white p-2 rounded" onClick={handleLogin}>
        로그인
      </button>
      <button className="bg-green-500 text-white p-2 rounded" onClick={handleSignup}>
        회원가입
      </button>
    </div>
  );
}
