import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="pt-20 pb-16 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-lg p-8"
        >
          <h1 className="text-2xl font-bold text-white mb-6">세이베리게임즈 Steam 판매용 패키지 오프라인 게임 약관</h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제1장. 소프트웨어의 사용 허가</h2>
              <div className="space-y-4">
                <p>1.1 본 소프트웨어 프로그램, 본 소프트웨어의 업데이트 프로그램 및 업데이트 프로그램으로 갱신된 본 소프트웨어 프로그램(이하 「본 제품」으로 한다)의 저작권 및 관련 지적 재산권은 모두 주식회사 세이베리게임즈(이하 「당사」로 한다) 또는 당사의 저작권 허가자에게 귀속됩니다.</p>
                <p>1.2 본 제품은 Steam 클라이언트를 통해 설치 및 다운로드 가능하며, 사용자는 본 약관에 동의 후 이용할 수 있습니다. 설치된 제품은 개인 사용 목적으로만 사용되어야 하며, 양도, 비독점 및 재허가는 불가합니다.</p>
                <p>1.3 본 소프트웨어 프로그램, 본 소프트웨어의 업데이트 프로그램 및 업데이트 프로그램으로 갱신된 본 소프트웨어 프로그램(이하 「본 제품」으로 한다)의 저작권 및 관련 지적 재산권은 모두 주식회사 세이베리게임즈(이하 「당사」로 한다) 또는 당사의 저작권 허가자에게 귀속됩니다.</p>
                <p>1.4 본 제품은 당사로부터 고객(이하 「사용자」로 한다)에게 사용 허가(라이선스)를 내리는 것으로, 판매하는 것이 아닙니다. 본 계약서로 인해 사용자에게 허가되지 않은 모든 권리는 당사 또는 당사의 저작권 허가자에게 유보됩니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제2장. 금지 사항</h2>
              <p className="mb-4">사용자는 본 제품의 올바른 사용을 위해, 아래에 명시된 행위를 할 수 없으며, 이에 대한 위반 시 법적 조치가 취해질 수 있습니다</p>
              <div className="space-y-2">
                <p>2.1 본 계약서에 명시된 경우를 제외한 본 제품의 복제, 개량 혹은 변경 및 양도 행위</p>
                <p>2.2 본 제품을 다른 소프트웨어에 결합하는 행위</p>
                <p>2.3 본 제품을 임대하거나 다른 상업적 목적으로 이용하는 행위</p>
                <p>2.4 본 제품 또는 본 제품의 일부를 당사의 명시적 허가 없이 인터넷 외의 수단을 통해 송신 또는 송신 가능한 상태로 만드는 행위</p>
                <p>2.5 본 제품에 대해 리버스 엔지니어링 등으로 데이터를 해석하는 행위</p>
                <p>2.6 본 계약서를 위반하는 행위</p>
                <p>2.7 본 제품의 사용 및 제4항에 정해진 사용자 서포트 이용에 대하여 당사의 원활한 업무 수행을 방해하는 행위</p>
                <p>2.8 본 제품을 구입한 타자나 제3자에게 불쾌감 또는 불이익을 조성하는 행위</p>
                <p>2.9 미풍양속을 위반하는 행위</p>
                <p>2.10 법칙 및 불법행위 등 그 외 법령을 위반하는 행위</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제3장. 사용자 서포트 이용 및 권익 보호</h2>
              <div className="space-y-2">
                <p>3.1 본 제품은 제품이 판매되는 기간 동안 Steam 상점 페이지에 게시된 고객 지원 웹사이트와 이메일을 통해 사용자 서포트를 제공합니다.</p>
                <p>3.2 당사는 본 제품의 개선을 위해 사용자의 의견을 적극 수렴하며 제품 개발에 있어 중요한 참고 자료로 활용합니다.</p>
                <p>3.3 사용자의 권익과 피해에 관한 문의에 대해서는 당사는 신의를 다해 해결할 것을 약속합니다.</p>
                <p>3.4 본 제품의 환불은 Steam 환불 정책을 따릅니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제4장. 본 제품 사용을 위한 동록</h2>
              <div className="space-y-2">
                <p>4.1 본 제품을 사용하려면 Steam 계정 등록 및 Steam 클라이언트 소프트웨어의 설치가 필요합니다.</p>
                <p>4.2 Steam 클라이언트 소프트웨어가 없을 경우, Steam 클라이언트 소프트웨어를 설치해야 합니다.</p>
                <p>4.3 Steam 계정이 없을 경우, Steam 내의 이용약관에 동의한 뒤 Steam 계정을 등록해야 합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제5장. 본 제품 사용을 위한 인터넷 환경</h2>
              <div className="space-y-2">
                <p>5.1 제5항의 등록 및 설치에 필요한 설비 및 서비스는 사용자 측에서 준비해야 하며, 필요한 인터넷 서비스 공급자를 사용할 때의 과금 및 통신비 등은 모두 사용자가 부담해야 합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제6장. 계약의 종료</h2>
              <div className="space-y-2">
                <p>사용자가 본 계약서의 조항을 위반했을 경우, 당사는 본 계약서의 기준에 따른 사용권 허가를 즉시 종료할 수 있습니다. 이 경우 사용자는 당사의 지시에 따라 본 제품에 대한 모든 구성 및 그 복제물을 파기, 또는 기록 매체에서 말소해야 합니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제7장. 유출 관리</h2>
              <div className="space-y-2">
                <p>7.1 사용자는 대한민국 정부 또는 각 국가의 정부로부터 필요한 허가 등을 얻지 않고도 본 제품의 전체 혹은 일부를 직접 혹은 간접적으로 유출할 수 없습니다.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">제8장. 일반 조항</h2>
              <div className="space-y-2">
                <p>8.1 본 계약서의 일부가 특정 이유로 무효화되어도 다른 부분은 이에 반하지 않는 범위 내에서 계속 유효합니다.</p>
                <p>8.2 본 계약서는 계약서의 성립, 효력, 해석 및 이행을 포함하여 모든 대한민국 정부의 법령에 따른 규율에 따릅니다.</p>
                <p>8.3 본 계약서의 영문판은 다른 언어로 구성된 계약서보다 우선시합니다.</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;