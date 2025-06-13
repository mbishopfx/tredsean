// Test Supabase Storage Integration
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bnrkzynwwrukchncdzus.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJucmt6eW53d3J1a2NobmNkenVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI3NDQwNCwiZXhwIjoyMDY0ODUwNDA0fQ.cS4fktp35ahxb-y_dw2EIsZO5iBnpmYfGA_cjfuoU2I';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSupabaseStorage() {
  console.log('🧪 Testing Supabase Storage Integration...\n');

  try {
    // Test 1: Upload a test campaign result
    console.log('📤 Test 1: Uploading test campaign result...');
    const testCampaignData = {
      campaignId: 'test_campaign_' + Date.now(),
      username: 'test_user',
      timestamp: new Date().toISOString(),
      results: {
        totalRecipients: 5,
        successful: 4,
        failed: 1,
        messagePreview: 'Test message for Supabase storage integration...'
      },
      metadata: {
        totalContacts: 5,
        successful: 4,
        failed: 1,
        messagePreview: 'Test message for Supabase storage integration...'
      }
    };

    const campaignFilePath = `campaigns/test_user/test_campaign_${Date.now()}.json`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('sms')
      .upload(campaignFilePath, JSON.stringify(testCampaignData, null, 2), {
        contentType: 'application/json',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return;
    }

    console.log('✅ Campaign result uploaded successfully!');
    console.log('   Path:', campaignFilePath);

    // Test 2: List files in campaigns folder
    console.log('\n📂 Test 2: Listing files in campaigns folder...');
    const { data: fileList, error: listError } = await supabase.storage
      .from('sms')
      .list('campaigns/test_user', {
        limit: 10,
        offset: 0
      });

    if (listError) {
      console.error('❌ List files failed:', listError);
      return;
    }

    console.log('✅ Files listed successfully!');
    console.log('   Found', fileList.length, 'files');
    fileList.forEach(file => {
      console.log('   -', file.name, '(', new Date(file.created_at).toLocaleString(), ')');
    });

    // Test 3: Upload a test CSV
    console.log('\n📊 Test 3: Uploading test cleaned CSV...');
    const testCsvData = `name,phone,company,email
John Doe,+14176297373,Test Company,john@test.com
Jane Smith,+16467705587,Another Corp,jane@another.com`;

    const csvFilePath = `cleaned-csvs/test_user/test_${Date.now()}.csv`;
    const { data: csvUploadData, error: csvUploadError } = await supabase.storage
      .from('sms')
      .upload(csvFilePath, testCsvData, {
        contentType: 'text/csv',
        upsert: true
      });

    if (csvUploadError) {
      console.error('❌ CSV upload failed:', csvUploadError);
      return;
    }

    console.log('✅ CSV uploaded successfully!');
    console.log('   Path:', csvFilePath);

    // Test 4: Upload activity log
    console.log('\n📝 Test 4: Uploading test activity log...');
    const testActivityLog = {
      username: 'test_user',
      action: 'single_sms_sent',
      timestamp: new Date().toISOString(),
      details: {
        phone: '+14176297373',
        messageLength: 45,
        message: 'Test message for storage integration...',
        provider: 'jon-device'
      }
    };

    const activityFilePath = `activity-logs/test_user/test_${Date.now()}_single_sms_sent.json`;
    const { data: activityUploadData, error: activityUploadError } = await supabase.storage
      .from('sms')
      .upload(activityFilePath, JSON.stringify(testActivityLog, null, 2), {
        contentType: 'application/json',
        upsert: true
      });

    if (activityUploadError) {
      console.error('❌ Activity log upload failed:', activityUploadError);
      return;
    }

    console.log('✅ Activity log uploaded successfully!');
    console.log('   Path:', activityFilePath);

    // Test 5: Get public URL
    console.log('\n🔗 Test 5: Getting public URL...');
    const { data: urlData } = supabase.storage
      .from('sms')
      .getPublicUrl(campaignFilePath);

    console.log('✅ Public URL generated!');
    console.log('   URL:', urlData.publicUrl);

    console.log('\n🎉 All Supabase storage tests passed!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Campaign results storage: Working');
    console.log('   ✅ CSV file storage: Working');
    console.log('   ✅ Activity logs storage: Working');
    console.log('   ✅ File listing: Working');
    console.log('   ✅ Public URLs: Working');
    console.log('\n🚀 Your SMS system will now automatically save:');
    console.log('   • All campaign results and reports');
    console.log('   • Cleaned CSV files with metadata');
    console.log('   • Activity logs for single messages');
    console.log('   • Future posts and content');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSupabaseStorage(); 