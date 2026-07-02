export const simulationsByGrade = [
  {
    id: "grade-6",
    grade: "6",
    accent: "success",
    title: "Toán 6 – Trực quan hóa số học và đối xứng",
    simulations: [
      {
        slug: "lop6-truc-so-nguyen",
        title: "Trục số nguyên động",
        tags: ["Số học", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop6-truc-so-nguyen",
        description:
          "Mô phỏng phép cộng, trừ số nguyên trên trục số bằng các bước nhảy trực quan giúp học sinh hiểu bản chất số âm.",
      },
      {
        slug: "lop6-doi-xung-hinh-phang",
        title: "Tìm đối xứng trong thực tế",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop6-doi-xung-hinh-phang",
        description:
          "Cắt, gấp và kiểm tra trục đối xứng, tâm đối xứng của các hình phẳng thường gặp qua thao tác tương tác.",
      },
    ],
  },
  {
    id: "grade-7",
    grade: "7",
    accent: "primary",
    title: "Toán 7 – Hình học không gian và số thực",
    simulations: [
      {
        slug: "lop7-trai-phang",
        title: "Trải phẳng hình không gian 3D",
        component: "spatial-nets",
        tags: ["3D không gian", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop7-trai-phang",
        description:
          "Chọn hình, kéo thanh trượt và quan sát quá trình khai triển mô hình 3D.",
      },
      // {
      //   slug: 'lop7-lang-tru-3d',
      //   title: 'Lăng trụ và hình khối 3D',
      //   component: 'spatial-nets',
      //   tags: ['3D không gian', 'React 3D'],
      //   tagType: 'geometry',
      //   status: 'Nâng cấp',
      //   description:
      //     'Bộ mô phỏng hình trải phẳng hỗ trợ lăng trụ tam giác, ngũ giác, lục giác, hình hộp và hình chóp.',
      // },
      {
        slug: "lop7-duong-dong-quy",
        title: "Ba đường đồng quy trong tam giác",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop7-duong-dong-quy",
        description:
          "Kéo thả các đỉnh tam giác để thấy trực quan trọng tâm, trực tâm và các đường đặc biệt luôn đồng quy.",
      },
    ],
  },
  {
    id: "grade-8",
    grade: "8",
    accent: "accent",
    title: "Toán 8 – Hằng đẳng thức, hàm số và hình đồng dạng",
    simulations: [
      {
        slug: "lop8-hang-dang-thuc",
        title: "Trực quan hằng đẳng thức (a + b)²",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop8-hang-dang-thuc",
        description:
          "Chứng minh (a + b)² = a² + 2ab + b² bằng cách ghép các mảnh diện tích tương tác.",
      },
      {
        slug: "lop8-do-thi-bac-nhat",
        title: "Đồ thị hàm số bậc nhất y = ax + b",
        tags: ["Hàm số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop8-do-thi-bac-nhat",
        description:
          "Khám phá độ dốc, tung độ gốc và giao điểm với trục tọa độ qua các thanh trượt thời gian thực.",
      },
    ],
  },
  {
    id: "grade-9",
    grade: "9",
    accent: "warning",
    title: "Toán 9 – Đường tròn và mô hình thực tế",
    simulations: [
      {
        slug: "lop9-ban-bong-parabol",
        title: "Bắn bóng Parabol y = ax²",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop9-ban-bong-parabol",
        description:
          "Dùng phương trình bậc hai để mô hình hóa quỹ đạo ném bóng và khám phá góc ném tối ưu.",
      },
      {
        // slug: 'lop9-goc-noi-tiep',
        title: "Góc nội tiếp và cung bị chắn",
        tags: ["Đường tròn", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop9-goc-noi-tiep",
        component: 'InscribedAngleSimulation',
        description:
          "Di chuyển đỉnh góc nội tiếp trên đường tròn, so sánh số đo góc nội tiếp với góc ở tâm.",
      },
    ],
  },
  {
    id: "probability-statistics",
    grade: "P",
    accent: "danger",
    title: "Xác suất và Thống kê – Lớp 6 đến 12",
    simulations: [
      {
        slug: "xac-suat-thong-ke",
        title: "Tung đồng xu và gieo xúc xắc",
        tags: ["Xác suất", "Nâng cấp"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/xac-suat-thong-ke",
        description:
          "Mô phỏng xác suất thực nghiệm, theo dõi tần suất và so sánh với xác suất lý thuyết qua biểu đồ.",
      },
      {
        slug: "xac-suat-thong-ke-freq",
        title: "Biểu đồ tần số và thống kê mô tả",
        tags: ["Thống kê", "Nâng cấp"],
        tagType: "algebra",
        status: "Đang phát triển",
        url: "/simulations/xac-suat-thong-ke#freq",
        description:
          "Nhập hoặc tạo dữ liệu ngẫu nhiên, vẽ biểu đồ tần số, tính trung bình, trung vị và độ lệch chuẩn.",
      },
    ],
  },
];

export function getAllSimulations() {
  return simulationsByGrade.flatMap((gradeGroup) =>
    gradeGroup.simulations.map((simulation) => ({
      ...simulation,
      grade: gradeGroup.grade,
      groupTitle: gradeGroup.title,
    })),
  );
}

// export function findSimulation(slug) {
//   return getAllSimulations().find((simulation) => simulation.slug === slug);
// }
export const allSimulations = simulationsByGrade.flatMap(
  grade => grade.simulations
);