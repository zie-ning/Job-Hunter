import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mockAuthAdapter } from "../adapters/authAdapter";
import { Card } from "../components/Card";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await mockAuthAdapter.signup(email, password);
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-5 py-16">
      <Card
        elevation="raised"
        padding="none"
        className="w-full max-w-(--container-auth) p-8"
      >
        {/* h1 태그는 index.css의 레거시 규칙과 충돌한다
            (docs/DESIGN.md §4 "알려진 한계" 참고) */}
        <div
          role="heading"
          aria-level={1}
          className="text-text-strong font-sans text-2xl font-bold"
        >
          회원가입
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />
          <TextField
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <Button type="submit" isLoading={isSubmitting}>
            회원가입
          </Button>
        </form>
        <p className="text-text mt-4 text-center text-sm">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-accent font-semibold">
            로그인
          </Link>
        </p>
      </Card>
    </div>
  );
}
