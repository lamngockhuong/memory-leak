import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DebugModule } from './modules/debug/debug.module';
import { MemoryLeakModule } from './modules/memory-leak/memory-leak.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DebugModule,
    MemoryLeakModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
