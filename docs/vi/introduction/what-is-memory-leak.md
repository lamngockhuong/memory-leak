# Memory Leak là gì?

**Memory leak** (rò rỉ bộ nhớ) xảy ra khi một chương trình cấp phát bộ nhớ nhưng không giải phóng nó trả lại hệ thống, ngay cả khi bộ nhớ đó không còn cần thiết. Theo thời gian, những khối bộ nhớ chưa được giải phóng này có thể khiến ứng dụng của bạn tiêu thụ ngày càng nhiều bộ nhớ, có thể dẫn đến:

- Hiệu suất ứng dụng giảm sút
- Hệ thống chạy chậm
- Ứng dụng crash (lỗi hết bộ nhớ)
- Máy chủ không ổn định trong môi trường production

## Cách quản lý bộ nhớ hoạt động

Để hiểu về memory leak, điều quan trọng là phải hiểu cách quản lý bộ nhớ hoạt động trong các môi trường khác nhau:

### Ngôn ngữ có Garbage Collection

Các ngôn ngữ như **JavaScript**, **Java**, **Kotlin**, và **Go** sử dụng quản lý bộ nhớ tự động thông qua garbage collection:

1. **Cấp phát**: Các đối tượng được tạo và bộ nhớ được cấp phát
2. **Sử dụng**: Ứng dụng sử dụng các đối tượng đã cấp phát
3. **Garbage Collection**: Runtime tự động giải phóng bộ nhớ cho các đối tượng không còn có thể truy cập

```javascript
// Bộ nhớ được cấp phát khi tạo đối tượng
let user = { name: "John", age: 30 };

// Bộ nhớ được tự động giải phóng khi 'user' ra khỏi scope
// và không có tham chiếu nào khác tồn tại
```

### Quản lý bộ nhớ thủ công

Các ngôn ngữ như **C** và **C++** yêu cầu quản lý bộ nhớ rõ ràng:

```c
// Cấp phát thủ công
char* buffer = malloc(1024);

// Phải giải phóng bộ nhớ thủ công
free(buffer);
```

## Các loại Memory Leak

### 1. **Classical Memory Leaks**

Bộ nhớ được cấp phát nhưng không bao giờ được giải phóng, ngay cả khi không còn có thể truy cập.

### 2. **Logical Memory Leaks**

Bộ nhớ vẫn được ứng dụng tham chiếu nhưng không còn phục vụ mục đích hữu ích nào.

### 3. **Temporary Memory Leaks**

Bộ nhớ cuối cùng được giải phóng nhưng được giữ lại lâu hơn cần thiết.

## Nguyên nhân phổ biến trong các ngôn ngữ khác nhau

### JavaScript/TypeScript

- **Biến toàn cục** tích lũy dữ liệu
- **Event listeners** không được gỡ bỏ đúng cách
- **Closures** giữ tham chiếu đến các đối tượng lớn
- **Detached DOM nodes**

### Java/Kotlin

- **Collections** phát triển không giới hạn
- **Listeners và callbacks** không được hủy đăng ký
- **ThreadLocal variables** không được dọn dẹp
- **ClassLoader leaks**

### Go

- **Goroutines** không bao giờ kết thúc
- **Channels** không bao giờ được đóng
- **Biến toàn cục** tích lũy dữ liệu
- **Circular references** trong cấu trúc dữ liệu

## Ví dụ về Memory Leak

Đây là một ví dụ đơn giản về memory leak trong JavaScript:

```javascript
// XẤU: Điều này tạo ra memory leak
let users = [];

function addUser(name) {
    users.push({
        name: name,
        timestamp: new Date(),
        data: new Array(1000000).fill('x') // Đối tượng lớn
    });
    // Mảng users tiếp tục phát triển và không bao giờ thu nhỏ!
}

setInterval(() => {
    addUser(`User-${Date.now()}`);
}, 1000);
```

```javascript
// TỐT: Điều này ngăn chặn memory leak
let users = [];
const MAX_USERS = 100;

function addUser(name) {
    users.push({
        name: name,
        timestamp: new Date(),
        data: new Array(1000000).fill('x')
    });

    // Chỉ giữ lại MAX_USERS entries cuối cùng
    if (users.length > MAX_USERS) {
        users.splice(0, users.length - MAX_USERS);
    }
}
```

## Dấu hiệu của Memory Leaks

### Chỉ số hiệu suất

- **Hiệu suất giảm dần** theo thời gian
- **Tăng sử dụng bộ nhớ** mà không tương ứng với tăng khối lượng công việc
- **Garbage collection** tạm dừng thường xuyên
- **Lỗi hết bộ nhớ** trong production

### Metrics giám sát

- **Kích thước heap** tăng liên tục
- **Sử dụng bộ nhớ** không trở về baseline sau các hoạt động
- **Áp lực GC** tăng theo thời gian

## Tác động đến ứng dụng

### Môi trường phát triển

- Chu kỳ phát triển và testing chậm hơn
- Yêu cầu tài nguyên cao hơn cho máy phát triển

### Môi trường Production

- **Vấn đề về khả năng mở rộng**: Máy chủ yêu cầu nhiều bộ nhớ hơn dự kiến
- **Vấn đề về độ tin cậy**: Ứng dụng crash bất ngờ
- **Tác động về chi phí**: Chi phí hạ tầng cao hơn
- **Trải nghiệm người dùng**: Thời gian phản hồi chậm và timeout

## Tổng quan về phòng ngừa

Mặc dù chúng tôi sẽ đề cập đến các chiến lược phòng ngừa chi tiết trong các phần sau, các nguyên tắc chính là:

1. **Hiểu vòng đời đối tượng** trong ứng dụng của bạn
2. **Dọn dẹp tài nguyên** một cách rõ ràng khi có thể
3. **Sử dụng công cụ profiling** để giám sát việc sử dụng bộ nhớ
4. **Triển khai giám sát** trong môi trường production
5. **Tuân theo best practices** đặc thù cho từng ngôn ngữ

## Các bước tiếp theo

Bây giờ bạn đã hiểu memory leak là gì, hãy khám phá:

- [Tại sao Memory Leak quan trọng](/vi/introduction/why-it-matters) - Tác động thực tế
- [Các mẫu Memory Leak phổ biến](/vi/introduction/common-patterns) - Nhận biết các tình huống điển hình
- [Chiến lược phát hiện](/vi/detection/strategies) - Cách tìm memory leak

Hoặc chuyển trực tiếp đến ngôn ngữ bạn quan tâm:

- [JavaScript/TypeScript](/vi/languages/javascript)
- [Java](/vi/languages/java)
- [Kotlin](/vi/languages/kotlin)
- [Go](/vi/languages/go)
