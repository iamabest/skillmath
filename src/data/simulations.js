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