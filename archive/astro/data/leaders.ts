import type { ImageMetadata } from 'astro';

import tjcImage from '~/assets/images/leaders/taojincheng.png';
import gkrImage from '~/assets/images/leaders/gongkairui.png';
import mxhImage from '~/assets/images/leaders/mengxiaohua.png';
import shihaoyuImage from '~/assets/images/leaders/shihaoyu.png';
import songhaoshengImage from '~/assets/images/leaders/songhaosheng.jpg';

export interface Leader {
  id: string;
  name: string;
  position: string;
  image: ImageMetadata;
  bio: string;
}

export const leadersData: Record<string, Leader> = {
  tjc: {
    id: 'tjc',
    name: '陶锦程',
    position: '董事长、天使投资人、支部书记',
    image: tjcImage,
    bio: '陶锦程，男，2004年1月生，汉族，江苏南京人，2020年10月加入中国共青团，2023年参加工作，宏翔商道（南京）科技发展有限公司首席天使投资人。\n\n中国人工智能协会会员、长江经济技术协会会员、南京市建邺区韶华工坊大学生创业园“创业导师”、全国大学生创新创业实践大赛2025年第一批入库专家。\n\n现任宏翔商道（南京）科技发展有限公司董事长、共青团宏翔商道（南京）科技发展有限公司团支部书记。',
  },
  mxh: {
    id: 'mxh',
    name: '孟小华',
    position: '首席财务官、董事',
    image: mxhImage,
    bio: '孟小华，女，1976年10月生，汉族，江苏南京人，1995年10月参加工作。\n\n孟小华女士拥有丰富的财务管理经验，担任首席财务官和副经理职务。她负责公司的财务规划、成本控制和风险管理，为公司的稳健发展提供了坚实的财务保障。',
  },
  gkr: {
    id: 'gkr',
    name: '龚凯瑞',
    position: '首席投资顾问、董事',
    image: gkrImage,
    bio: '龚凯瑞，男，2004年1月生，汉族，江苏淮安人。现任佰唤科技董事长，加速资本投资执行顾问合伙人；致力于青年教育、投资及创业孵化，成功投资孵化官禾科技（1000万A轮融资）、汽震智能、朵芭安餐饮、光子互娱、中视央广等知名项目。\n\n受聘全国大学生创新创业实践大赛组委会执行主席、国际职业及专业技能大赛首席智库专家、“科创中国”（中国科协主办）专家库专家、中国最佳商业领袖奖评审委员会委员、上合组织青年创业交流基地青年创业导师、梧桐商会青年工作委员会主席、海南自贸港女性创新创业导师、高校毕业生就业协会校企合作委员会（国家一级社团组织）创新创业导师、南京建邺韶华工坊（省级大学生创业示范园）创业导师、南朗青年创新创业园（中山市创业孵化示范基地）创业导师、大创工场创业孵化器创新创业就业专家智库特聘专家。\n\n担任华南理工大学、广西师范大学、辽宁石油化工大学、华东师范大学、江苏联合职业技术学院等多所高校创新创业导师；江苏省大学生创新大赛决赛评审专家、湖北省“互联网+”大学生创新创业大赛评审专家、辽宁省首届大学生职业规划大赛决赛评委、广州博士信息技术研究院有限公司（高新技术企业、瞪羚企业）产业发展顾问等..',
  },
  songhaosheng: {
    id: 'songhaosheng',
    name: '宋昊晟',
    position: '执行董事',
    image: songhaoshengImage,
    bio: '宋昊晟，男，2001年10月生，汉族，江苏溧阳人，本科学历，学士学位。\n\n现担任南京林汐智觉科技有限公司执行董事。精通计算机技术，具备扎实的技术应用与项目执行能力。拥有专业摄影技能，擅长视觉内容创作与影像记录。运营个人工作室期间，统筹项目策划、技术实施与内容产出等工作，积累了丰富的团队管理与商业运营经验。线下深度参与创新创业生态建设，先后受邀参与长三角民营经济创新峰会等交流活动，在创新创业教育与实践服务领域形成了兼具理论高度与实操价值的个人优势。',
  },
    shihaoyu: {
    id: 'shihaoyu',
    name: '施浩宇',
    position: '执行董事',
    image: shihaoyuImage,
    bio: '施浩宇，男，2007年4月生，汉族，江苏淮安人。现任桐谷霁屿（南京）科技发展有限公司执行董事。\n\n在人工智能与大模型安全治理领域拥有深厚造诣与前瞻性布局，曾作为核心架构师自主研发并开源了基于 PTDCoreBase 高性能内核的 AI 安全防御基础设施；该系统创新性地融合了启发式检测算法与动态对抗策略，有效解决了大语言模型在开放网络环境下面临的提示词注入与逻辑越狱难题。\n\n相关技术成果不仅定义了新一代智能体（Agent）交互的安全合规标准，更作为核心安全组件深度集成于知名的 AstrBot (https://astrbot.app/) 生态体系中，在开源社区获得了广泛关注并经受了大规模用户场景的落地验证。\n\n不仅具备构建高可用、高并发技术底座的实战能力，更擅长打造追求卓越的工程师文化，致力于通过构建具备“防御深度”与“商业弹性”的技术体系，为企业在 AI 时代的持续创新与市场突围构建坚实的护城河。',
  },
};

export default leadersData;
