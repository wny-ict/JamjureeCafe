import React, { useState } from 'react';
import { Coffee, Key, UserCheck, Shield } from 'lucide-react';
import schoolLogo from '../school_logo.png';

export default function Login({ onLogin, passwords }) {
  const [role, setRole] = useState('staff'); // 'staff' | 'admin'
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // กรองรหัสผ่านสดจากกูเกิลชีต (หากชีตออฟไลน์จะใช้รหัสพาสเวิร์ดเริ่มต้นเป็น cafe2026 และ admin@2026)
    const activeCreds = passwords || { staff: 'cafe2026', admin: 'admin@2026' };

    if (role === 'staff') {
      if (password === activeCreds.staff) {
        onLogin('staff');
      } else {
        setError('รหัสผ่านเจ้าหน้าที่ไม่ถูกต้อง');
      }
    } else if (role === 'admin') {
      if (password === activeCreds.admin) {
        onLogin('admin');
      } else {
        setError('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <img src={schoolLogo} className="login-logo-img" alt="โลโก้โรงเรียน" />
        </div>
        
        <div className="login-header">
          <h1>Jamjuree Cafe</h1>
          <p>ระบบบันทึกรายรับ-รายจ่าย โรงเรียนวังน้ำเย็นวิทยาคม</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>เลือกบทบาทการเข้าใช้งาน</label>
            <div className="role-select-box">
              <button
                type="button"
                className={`role-select-btn ${role === 'staff' ? 'active' : ''}`}
                onClick={() => { setRole('staff'); setPassword(''); setError(''); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <UserCheck size={16} />
                  <span>เจ้าหน้าที่</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-select-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => { setRole('admin'); setPassword(''); setError(''); }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                  <Shield size={16} />
                  <span>แอดมิน</span>
                </div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่านเพื่อความปลอดภัย</label>
            <div className="search-input-wrapper">
              <Key className="search-icon" size={16} />
              <input
                id="password"
                type="password"
                placeholder="กรอกรหัสผ่านเข้าใช้งาน..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
              ⚠️ {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>
            เข้าสู่ระบบ
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} Jamjuree Cafe • โรงเรียนวังน้ำเย็นวิทยาคม</p>
          <p>Developer : PANITTHA BOONYONG</p>
        </div>
      </div>
    </div>
  );
}
