const axios = require('axios');

const BASE_URL = 'http://118.107.4.158:1337';
const API_URL = `${BASE_URL}/api/auth/invite-register`;

// 测试结果记录
const testResults = {
    passed: 0,
    failed: 0,
    details: []
};

// 记录测试结果
function logTest(testName, success, response, expected) {
    const result = {
        test: testName,
        success,
        response: response?.data || response?.message,
        expected,
        timestamp: new Date().toISOString()
    };
    
    testResults.details.push(result);
    
    if (success) {
        testResults.passed++;
        console.log(`✅ ${testName} - 通过`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName} - 失败`);
        console.log(`   期望: ${expected}`);
        console.log(`   实际: ${JSON.stringify(response?.data || response?.message)}`);
    }
}

// 执行注册请求
async function testRegistration(data, testName, expectedSuccess = true, expectedMessage = null) {
    try {
        const response = await axios.post(API_URL, data, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true // 不抛出HTTP错误
        });
        
        const success = expectedSuccess ? 
            (response.status === 200 && response.data.success) : 
            (response.status === 400 && response.data.error);
            
        logTest(testName, success, response, expectedMessage);
        
        return response;
    } catch (error) {
        logTest(testName, false, error, expectedMessage);
        return null;
    }
}

// 测试用例
async function runAllTests() {
    console.log('🚀 开始用户注册流程测试...\n');
    
    // 1. 正常注册流程测试
    console.log('📝 1. 正常注册流程测试');
    console.log('='.repeat(50));
    
    // 1.1 使用有效邀请码注册
    await testRegistration({
        username: 'testuser001',
        email: 'test001@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '1.1 有效邀请码注册', true, '注册成功');
    
    // 1.2 使用另一个有效邀请码
    await testRegistration({
        username: 'testuser002',
        email: 'test002@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '1.2 另一个有效邀请码注册', false, '用户名或邮箱已存在');
    
    console.log('\n📝 2. 无效邀请码注册测试');
    console.log('='.repeat(50));
    
    // 2.1 无效邀请码格式
    await testRegistration({
        username: 'testuser003',
        email: 'test003@example.com',
        password: '123456',
        inviteCode: '123'
    }, '2.1 邀请码格式无效', false, '邀请码格式无效');
    
    // 2.2 空邀请码
    await testRegistration({
        username: 'testuser004',
        email: 'test004@example.com',
        password: '123456',
        inviteCode: ''
    }, '2.2 空邀请码', false, '邀请码格式无效');
    
    // 2.3 不存在的邀请码
    await testRegistration({
        username: 'testuser005',
        email: 'test005@example.com',
        password: '123456',
        inviteCode: 'ZZZZ99999'
    }, '2.3 不存在的邀请码', false, '邀请码无效');
    
    console.log('\n📝 3. 重复用户名/邮箱注册测试');
    console.log('='.repeat(50));
    
    // 3.1 重复用户名
    await testRegistration({
        username: 'testuser001',
        email: 'test006@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '3.1 重复用户名', false, '用户名或邮箱已存在');
    
    // 3.2 重复邮箱
    await testRegistration({
        username: 'testuser006',
        email: 'test001@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '3.2 重复邮箱', false, '用户名或邮箱已存在');
    
    console.log('\n📝 4. 输入格式验证测试');
    console.log('='.repeat(50));
    
    // 4.1 用户名太短
    await testRegistration({
        username: 'ab',
        email: 'test007@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '4.1 用户名太短', false, '用户名至少3个字符，最多20个字符');
    
    // 4.2 用户名太长
    await testRegistration({
        username: 'thisisareallylongusername123456789',
        email: 'test008@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '4.2 用户名太长', false, '用户名至少3个字符，最多20个字符');
    
    // 4.3 无效邮箱格式
    await testRegistration({
        username: 'testuser007',
        email: 'invalid-email',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '4.3 无效邮箱格式', false, '邮箱格式无效');
    
    // 4.4 密码太短
    await testRegistration({
        username: 'testuser008',
        email: 'test009@example.com',
        password: '123',
        inviteCode: 'AN2CN12D'
    }, '4.4 密码太短', false, '密码至少6个字符');
    
    // 4.5 空用户名
    await testRegistration({
        username: '',
        email: 'test010@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '4.5 空用户名', false, '用户名至少3个字符，最多20个字符');
    
    // 4.6 空邮箱
    await testRegistration({
        username: 'testuser009',
        email: '',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '4.6 空邮箱', false, '邮箱格式无效');
    
    // 4.7 空密码
    await testRegistration({
        username: 'testuser010',
        email: 'test011@example.com',
        password: '',
        inviteCode: 'AN2CN12D'
    }, '4.7 空密码', false, '密码至少6个字符');
    
    console.log('\n📝 5. 边界值测试');
    console.log('='.repeat(50));
    
    // 5.1 用户名最小长度
    await testRegistration({
        username: 'abc',
        email: 'test012@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '5.1 用户名最小长度', true, '注册成功');
    
    // 5.2 用户名最大长度
    await testRegistration({
        username: 'abcdefghijklmnopqrst',
        email: 'test013@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '5.2 用户名最大长度', true, '注册成功');
    
    // 5.3 密码最小长度
    await testRegistration({
        username: 'testuser011',
        email: 'test014@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '5.3 密码最小长度', true, '注册成功');
    
    console.log('\n📝 6. 特殊字符测试');
    console.log('='.repeat(50));
    
    // 6.1 用户名包含特殊字符
    await testRegistration({
        username: 'test<user>012',
        email: 'test015@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '6.1 用户名包含特殊字符', true, '注册成功');
    
    // 6.2 邮箱包含特殊字符
    await testRegistration({
        username: 'testuser012',
        email: 'test<script>@example.com',
        password: '123456',
        inviteCode: 'AN2CN12D'
    }, '6.2 邮箱包含特殊字符', false, '邮箱格式无效');
    
    console.log('\n📝 7. 邀请码生成唯一性测试');
    console.log('='.repeat(50));
    
    // 7.1 多次注册测试邀请码唯一性
    const inviteCodes = new Set();
    for (let i = 0; i < 5; i++) {
        try {
            const response = await axios.post(API_URL, {
                username: `uniquetest${i}`,
                email: `uniquetest${i}@example.com`,
                password: '123456',
                inviteCode: 'AN2CN12D'
            }, {
                headers: { 'Content-Type': 'application/json' },
                validateStatus: () => true
            });
            
            if (response.status === 200 && response.data.success) {
                const newInviteCode = response.data.inviteCode;
                if (inviteCodes.has(newInviteCode)) {
                    logTest(`7.${i+1} 邀请码唯一性测试`, false, null, '邀请码应该唯一');
                } else {
                    inviteCodes.add(newInviteCode);
                    logTest(`7.${i+1} 邀请码唯一性测试`, true, null, '邀请码生成成功');
                }
            } else {
                logTest(`7.${i+1} 邀请码唯一性测试`, false, response, '注册应该成功');
            }
        } catch (error) {
            logTest(`7.${i+1} 邀请码唯一性测试`, false, error, '注册应该成功');
        }
    }
    
    // 输出测试总结
    console.log('\n📊 测试总结');
    console.log('='.repeat(50));
    console.log(`✅ 通过: ${testResults.passed}`);
    console.log(`❌ 失败: ${testResults.failed}`);
    console.log(`📈 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(2)}%`);
    
    console.log('\n📋 详细测试结果:');
    testResults.details.forEach((result, index) => {
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${index + 1}. ${result.test}`);
    });
    
    return testResults;
}

// 运行测试
runAllTests().catch(console.error); 