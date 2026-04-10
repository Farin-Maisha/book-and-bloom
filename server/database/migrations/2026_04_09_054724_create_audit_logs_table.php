<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAuditLogsTable extends Migration
{
   public function up()
{
    if (!Schema::hasTable('audit_logs')) {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->string('entity_type');
            $table->bigInteger('entity_id');
            $table->string('entity_name');
            $table->text('changes')->nullable();
            $table->bigInteger('performed_by');
            $table->string('performed_by_name');
            $table->timestamps();
        });
    }
}

    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
}
