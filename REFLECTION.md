# REFLECTION

สิ่งที่ท้าทายในการเริ่มโปรเจกต์นี้คือการเลือกว่าอะไรที่ต้องเขียน และอะไรที่ไม่ต้องเขียน
เช่น การไม่เอา UserRepository, register endpoint และ Zod รวมถึงการเลือก infrastructure
อย่าง Render และ Turso ให้เหมาะกับขอบเขตของงาน

การ deploy ก็เจอปัญหาที่ไม่คาดไว้ คือ runMigrations() ต้อง await เสร็จก่อน app.listen()
เพราะถ้า request เข้ามาก่อน migration วิ่งเสร็จ column ยังไม่มีอยู่เลย
และ NEXT_PUBLIC_API_URL บน Vercel กลายเป็น undefined เพราะ .env.local ถูก gitignore
URL จริงที่ส่งไปคือ "undefined/api/auth/login" ซึ่งหาสาเหตุยากกว่าที่คิด เพราะ locally ทุกอย่างปกติ

การ optimize client side คือความต่างระหว่าง optimistic update กับ re-fetch
การ map response กลับเข้า state โดยตรงหลัง PATCH เร็วกว่าและไม่เสีย scroll position
แต่ต้องมี fallback ที่ typed เสมอ เพราะ API response แม้จะเป็น backend ของตัวเองก็ถือเป็น uncontrolled input
และ catch block ที่ดีต้องทำสองอย่างพร้อมกัน — log สำหรับ developer และ message สำหรับ user
สองอย่างนี้ไม่แทนที่กัน และนี่คือสิ่งที่ลืมบ่อยที่สุด
