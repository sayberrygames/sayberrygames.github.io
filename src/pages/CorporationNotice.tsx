import { motion } from 'framer-motion';

const CorporationNotice = () => {
  return (
    <div className="pt-20 pb-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-lg p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-8">법인 설립 공고</h1>
          
          <div className="space-y-8 text-gray-300">
            <div className="space-y-4">
              <p className="text-lg text-gray-400">2023-02-06</p>
              <p className="text-2xl font-semibold mb-6">
                "세이베리 게임즈 주식회사"는 2023년 01월 31일 설립하였습니다.
              </p>
            </div>

            <div className="space-y-4">
              <p className="font-semibold">(목적) 당 회사는 다음 사업을 목적으로 한다.</p>
              <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>응용 소프트웨어 개발 및 공급업</li>
                <li>유선 온라인 게임 소프트웨어 개발 및 공급업</li>
                <li>기타 게임 소프트웨어 개발 및 공급업</li>
                <li>소프트웨어 및 컴퓨터 주변기기 도매 및 소매업</li>
                <li>컴퓨터 프로그래밍 서비스업</li>
                <li>소프트웨어 연구개발업</li>
                <li>위 각 호에 관련된 부대사업 일체</li>
              </ol>
            </div>

            <div className="text-right mt-8">
              <p className="text-xl font-semibold">대표이사 배 소 희</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CorporationNotice;