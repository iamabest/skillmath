export interface SimulationItem {
  slug: string;
  title: string;
  tags: string[];
  tagType: string;
  status: "Sẵn sàng" | "Đang phát triển" | "Mới";
  url: string;
  description: string;
  component?: string;
  grade?: string;
  groupTitle?: string;
}

export interface GradeGroup {
  id: string;
  grade: string;
  accent: string;
  title: string;
  simulations: SimulationItem[];
}

export const simulationsByGrade: GradeGroup[] = [
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
      {
        slug: "lop6-sang-eratosthenes",
        title: "Số nguyên tố",
        tags: ["Số học", "3D"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop6-sang-eratosthenes",
        description:
          "Trực quan hóa quá trình tìm số nguyên tố bằng cách loại bỏ các hợp số trong không gian 3D.",
      },
      {
        slug: "lop6-phan-so-lat-cat",
        title: "Phân số",
        tags: ["Số học", "3D"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop6-phan-so-lat-cat",
        description:
          "Cắt hình trụ và hình tròn theo tỷ lệ phần trăm để hiểu rõ mối quan hệ giữa phân số, số thập phân và phần trăm.",
      },
      {
        slug: "lop6-thuoc-do-goc",
        title: "Thước đo góc tương tác",
        tags: ["Hình học", "Mới"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop6-thuoc-do-goc",
        description:
          "Học đo góc bằng thước đo góc ảo tương tác, xoay thước đo và đọc số đo các góc từ dễ đến khó.",
      },
      {
        slug: "lop6-may-tinh-phan-so",
        title: "Máy tính phân số",
        tags: ["Số học", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop6-may-tinh-phan-so",
        description: "Thực hiện phép tính phân số từng bước trực quan với mô hình cắt bánh."
      },
      {
        slug: "lop6-uoc-boi-chung",
        title: "Ước chung và Bội chung",
        tags: ["Số học", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop6-uoc-boi-chung",
        description: "Tìm UCLN và BCNN qua phân tích thừa số nguyên tố và biểu đồ Venn."
      },
      {
        slug: "lop6-ban-do-toa-do",
        title: "Bản đồ tọa độ 2D",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop6-ban-do-toa-do",
        description: "Làm quen với hệ trục tọa độ Oxy qua trò chơi tìm điểm bí mật."
      }
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
 
      {
        slug: "lop7-duong-dong-quy",
        title: "Ba đường đồng quy trong tam giác",
        tags: ["Hình học", "Mới"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop7-duong-dong-quy",
        description:
          "Kéo thả các đỉnh tam giác để thấy trực quan trọng tâm, trực tâm và các đường đặc biệt luôn đồng quy.",
      },
      {
        slug: "lop7-can-don-ti-le",
        title: "Cân đòn Tỉ lệ thức 3D",
        tags: ["Số học", "3D"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop7-can-don-ti-le",
        description:
          "Mô phỏng cân đòn 3D trực quan để hiểu tỉ lệ thức: cân thăng bằng khi và chỉ khi a/b = c/d.",
      },
      {
        slug: "lop7-cat-tuyen-goc",
        title: "Góc tạo bởi cát tuyến cắt 2 đường thẳng",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop7-cat-tuyen-goc",
        description:
          "Tìm hiểu các góc so le trong, đồng vị, trong cùng phía khi một đường thẳng cắt hai đường thẳng song song.",
      },
      {
        slug: "lop7-dung-tam-giac",
        title: "Xưởng lắp ráp tam giác",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop7-dung-tam-giac",
        description:
          "Tự tay nhập độ dài 3 cạnh để dựng tam giác, khám phá bất đẳng thức tam giác thông qua hình ảnh trực quan sinh động.",
      },
      {
        slug: "lop7-ham-so-y-ax",
        title: "Đồ thị hàm số y = ax",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop7-ham-so-y-ax",
        description: "Khảo sát sự biến thiên của hàm số y = ax qua thanh trượt hệ số a."
      },
      {
        slug: "lop7-goc-trong-tam-giac",
        title: "Tổng ba góc của tam giác",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop7-goc-trong-tam-giac",
        description: "Chứng minh trực quan tổng ba góc trong tam giác luôn bằng 180 độ."
      },
      {
        slug: "lop7-so-thuc-truc-so",
        title: "Số thực trên trục số",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop7-so-thuc-truc-so",
        description: "Biểu diễn số hữu tỉ và số vô tỉ (√2, π) trên trục số thực, phóng to để xem chi tiết."
      }
    ],
  },
  {
    id: "grade-8",
    grade: "8",
    accent: "accent",
    title: "Toán 8 – Hằng đẳng thức, hàm số và hình đồng dạng",
    simulations: [
      {
        slug: "lop8-phong-thi-nghiem-3d",
        title: "Phòng thí nghiệm 3D Lớp 8",
        tags: ["3D", "Không gian"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop8-phong-thi-nghiem-3d",
        description: "Mô phỏng 3D lăng trụ đứng và hình chóp đều, cho phép tương tác tuỳ chỉnh thông số.",
      },
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
      {
        slug: "lop8-pitago-chat-long",
        title: "Định lý Pitago bằng chất lỏng",
        tags: ["Hình học", "Mới"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop8-pitago-chat-long",
        description:
          "Chứng minh a² + b² = c² bằng mô phỏng nước chảy từ bình cạnh huyền lấp đầy hai bình hai cạnh góc vuông.",
      },
      {
        slug: "lop8-tien-hoa-tu-giac",
        title: "Cỗ máy tiến hóa Tứ giác",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop8-tien-hoa-tu-giac",
        description:
          "Tự động và thủ công co giãn tứ giác để xem sự tiến hóa từ Tứ giác thường thành Hình bình hành, Hình chữ nhật, Hình thoi và Hình vuông.",
      },
      {
        slug: "lop8-thales-do-chieu-cao",
        title: "Đo chiều cao bằng định lý Thales",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop8-thales-do-chieu-cao",
        description:
          "Sử dụng định lý Thales và tam giác đồng dạng để đo chiều cao gián tiếp của một cái cây dựa vào bóng mặt trời.",
      },
      {
        slug: "lop8-hang-dang-thuc-2",
        title: "Hằng đẳng thức (a-b)² và a²-b²",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop8-hang-dang-thuc-2",
        description: "Trực quan hóa bình phương của một hiệu và hiệu hai bình phương bằng diện tích."
      },
      {
        slug: "lop8-phuong-trinh-can-bang",
        title: "Phương trình bậc nhất - Cân bằng",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop8-phuong-trinh-can-bang",
        description: "Giải phương trình ax + b = c từng bước sử dụng nguyên lý cân đòn thăng bằng."
      },
      {
        slug: "lop8-hinh-dong-dang",
        title: "Hình đồng dạng & Phép vị tự",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop8-hinh-dong-dang",
        description: "Khám phá tỉ số đồng dạng, diện tích của hai hình tam giác qua tâm vị tự O."
      }
    ],
  },
  {
    id: "grade-9",
    grade: "9",
    accent: "warning",
    title: "Toán 9 – Đường tròn và mô hình thực tế",
    simulations: [
      {
        slug: "lop9-khoi-tron-xoay",
        title: "Khối tròn xoay 3D",
        tags: ["3D", "Không gian"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop9-khoi-tron-xoay",
        description: "Khám phá hình trụ, hình nón và hình cầu 3D với góc quay thời gian thực.",
      },
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
        slug: "lop9-goc-noi-tiep",
        url: "/simulations/lop9-goc-noi-tiep",
        component: 'InscribedAngleSimulation',
        description:
          "Di chuyển đỉnh góc nội tiếp trên đường tròn, so sánh số đo góc nội tiếp với góc ở tâm.",
      },
      {
        slug: "lop9-thiet-dien-hinh-khoi",
        title: "Thiết diện của hình khối 3D",
        tags: ["3D", "Không gian"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop9-thiet-dien-hinh-khoi",
        description: "Dùng mặt phẳng cắt (clipping plane) cắt qua các khối 3D để khám phá thiết diện được tạo thành.",
      },
      {
        slug: "lop9-duong-tron-luong-giac",
        title: "Đường tròn lượng giác 3D",
        tags: ["Hàm số", "MỚi"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop9-duong-tron-luong-giac",
        description:
          "Di chuyển điểm trên đường tròn đơn vị để khám phá giá trị sin, cos và đồ thị hàm số lượng giác.",
      },
      {
        slug: "lop9-vi-tri-duong-tron",
        title: "Vị trí tương đối của hai đường tròn",
        tags: ["Đường tròn", "Mới"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop9-vi-tri-duong-tron",
        description:
          "Thay đổi khoảng cách tâm và bán kính để xem 5 vị trí tương đối giữa hai đường tròn: ngoài nhau, tiếp xúc, cắt nhau...",
      },
      {
        slug: "lop9-he-phuong-trinh",
        title: "Hệ phương trình bậc nhất hai ẩn",
        tags: ["Đại số", "Mới"],
        tagType: "algebra",
        status: "Mới",
        url: "/simulations/lop9-he-phuong-trinh",
        description:
          "Trực quan hóa hệ hai phương trình bậc nhất hai ẩn dưới dạng hai đường thẳng giao nhau để tìm nghiệm.",
      },
      {
        slug: "lop9-can-thuc-bac-hai",
        title: "Căn thức bậc hai trực quan",
        tags: ["Đại số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop9-can-thuc-bac-hai",
        description: "Khám phá ý nghĩa hình học của căn bậc hai và rút gọn biểu thức chứa căn."
      },
      {
        slug: "lop9-parabol-nang-cao",
        title: "Đồ thị Parabola y = ax² + bx + c",
        tags: ["Hàm số", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/lop9-parabol-nang-cao",
        description: "Khảo sát chuyên sâu đỉnh, trục đối xứng và nghiệm của phương trình bậc 2."
      },
      {
        slug: "lop9-duong-tron-ngoai-noi-tiep",
        title: "Đường tròn Ngoại tiếp & Nội tiếp",
        tags: ["Hình học", "Hoạt động"],
        tagType: "geometry",
        status: "Sẵn sàng",
        url: "/simulations/lop9-duong-tron-ngoai-noi-tiep",
        description: "Dựng và tính toán bán kính R, r của đường tròn ngoại tiếp, nội tiếp tam giác."
      }
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
        url: "/simulations/xac-suat-thong-ke-freq",
        description:
          "Nhập hoặc tạo dữ liệu ngẫu nhiên, vẽ biểu đồ tần số, tính trung bình, trung vị và độ lệch chuẩn.",
      },
      {
        slug: "xac-suat-bieu-do-thong-ke",
        title: "Biểu đồ thống kê đa dạng",
        tags: ["Thống kê", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/xac-suat-bieu-do-thong-ke",
        description: "Trực quan hóa dữ liệu bằng biểu đồ cột, đường, tròn và tính số đặc trưng."
      },
      {
        slug: "xac-suat-so-do-cay",
        title: "Không gian mẫu - Sơ đồ cây",
        tags: ["Xác suất", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/xac-suat-so-do-cay",
        description: "Vẽ sơ đồ cây liệt kê kết quả của phép thử tung đồng xu, gieo xúc xắc."
      },
      {
        slug: "xac-suat-phan-phoi-binomial",
        title: "Phân phối xác suất Binomial",
        tags: ["Xác suất", "Hoạt động"],
        tagType: "algebra",
        status: "Sẵn sàng",
        url: "/simulations/xac-suat-phan-phoi-binomial",
        description: "Mô phỏng hàm khối lượng xác suất B(n,p) và các đặc trưng kỳ vọng, phương sai."
      }
    ],
  },
];

export function getAllSimulations(): SimulationItem[] {
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
export const allSimulations: SimulationItem[] = simulationsByGrade.flatMap(
  grade => grade.simulations
);