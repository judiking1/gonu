import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Home: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-white">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">한국 전통 놀이</span>
                  <span className="block text-indigo-600">온라인 고누</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  전통 놀이 고누를 온라인에서 즐겨보세요. 친구들과 함께
                  실시간으로 대전을 즐기고, 다양한 고누 규칙을 배워볼 수
                  있습니다.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/lobby"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                    >
                      게임 시작하기
                    </Link>
                  </div>
                  {!user && (
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to="/register"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10"
                      >
                        회원가입
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* 특징 섹션 */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              특징
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              온라인 고누의 장점
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    🎮
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    실시간 대전
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  친구들과 실시간으로 대전을 즐길 수 있습니다.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    📱
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    모바일 지원
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  PC, 모바일 등 다양한 기기에서 즐길 수 있습니다.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    🎯
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    다양한 규칙
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  여러 가지 고누 규칙을 배우고 즐길 수 있습니다.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    🏆
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    랭킹 시스템
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  다른 플레이어들과 경쟁하며 실력을 키울 수 있습니다.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
