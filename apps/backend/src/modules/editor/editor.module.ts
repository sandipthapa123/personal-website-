import { Module } from '@nestjs/common';
import { EditorController } from './editor.controller';
import { EditorService } from './editor.service';
import { EditorValidationService } from './editor-validation.service';
import { EditorExporterService } from './editor-exporter.service';

@Module({
  controllers: [EditorController],
  providers: [
    EditorService,
    EditorValidationService,
    EditorExporterService,
  ],
  exports: [
    EditorService,
    EditorValidationService,
    EditorExporterService,
  ],
})
export class EditorModule {}
