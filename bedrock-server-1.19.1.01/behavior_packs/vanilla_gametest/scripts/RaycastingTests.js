import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
  BlockRaycastOptions,
  EntityRaycastOptions,
  MinecraftBlockTypes,
  Location,
  Vector,
} from "mojang-minecraft";

const replacementBlock = MinecraftBlockTypes.redGlazedTerracotta;

function lookAtThree(test, blocks, blockVectorOptions) {
    const player = test.spawnSimulatedPlayer(new BlockLocation(2, 9, 2), "Player");

    test.startSequence()
        .thenExecuteAfter(10, () => {
            player.lookAtBlock(blocks[0]);
        })
        .thenExecuteAfter(10, () => {
            var block = player.getBlockFromViewVector(blockVectorOptions);
            const relativePos = test.relativeBlockLocation(block.location);
            test.assert(relativePos.equals(blocks[0]), "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]");
            block.setType(replacementBlock);

            player.lookAtBlock(blocks[1]);
        })
        .thenExecuteAfter(10, () => {
            var block = player.getBlockFromViewVector(blockVectorOptions);
            const relativePos = test.relativeBlockLocation(block.location);
            test.assert(relativePos.equals(blocks[1]), "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]");
            block.setType(replacementBlock);
            player.lookAtBlock(blocks[2]);
        })
        .thenExecuteAfter(10, () => {
            var block = player.getBlockFromViewVector(blockVectorOptions);
            const relativePos = test.relativeBlockLocation(block.location);
            test.assert(relativePos.equals(blocks[2]), "Locations should match, but got [" + relativePos.x + "," + relativePos.y + ", " + relativePos.z + "]");
            block.setType(replacementBlock);
        })
        .thenSucceed();
}

GameTest.register("RaycastingTests", "player_looks_under_water", (test) => {
    var blocks = [new BlockLocation(1, 1, 1), new BlockLocation(2, 1, 1), new BlockLocation(3, 1, 1)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = false;
    blockVectorOptions.includeLiquidBlocks = false;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_at_water", (test) => {
    var blocks = [new BlockLocation(1, 2, 1), new BlockLocation(2, 2, 1), new BlockLocation(3, 2, 1)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = true;
    blockVectorOptions.includeLiquidBlocks = true;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_under_carpet", (test) => {
    var blocks = [new BlockLocation(1, 2, 0), new BlockLocation(2, 2, 0), new BlockLocation(3, 2, 0)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = false;
    blockVectorOptions.includeLiquidBlocks = false;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);

GameTest.register("RaycastingTests", "player_looks_at_carpet", (test) => {
    var blocks = [new BlockLocation(1, 3, 0), new BlockLocation(2, 3, 0), new BlockLocation(3, 3, 0)];

    const blockVectorOptions = new BlockRaycastOptions();
    blockVectorOptions.includePassableBlocks = true;
    blockVectorOptions.includeLiquidBlocks = false;

    lookAtThree(test, blocks, blockVectorOptions);
})
    .maxTicks(50)
    .structureName("RaycastingTests:player_looks_block")
    .tag(GameTest.Tags.suiteDefault);


GameTest.register("RaycastingTests", "get_block_from_vector", (test) => {

    let dimension = test.getDimension();
    const blockVectorOptions = new BlockRaycastOptions();


    blockVectorOptions.includePassableBlocks = false;
    blockVectorOptions.includeLiquidBlocks = false;

    const bars = dimension.getBlockFromRay(test.worldLocation(new Location(.5, 2, 1.5)), new Vector(1, 0, 0), blockVectorOptions);
    test.assert(bars.type == MinecraftBlockTypes.ironBars, "Expected to see through the banner and the water to the iron bars");

    blockVectorOptions.includePassableBlocks = true;
    const banner = dimension.getBlockFromRay(test.worldLocation(new Location(.5, 2, 1.5)), new Vector(1, 0, 0), blockVectorOptions);
    test.assert(banner.type == MinecraftBlockTypes.standingBanner, "Expected to see through the water to the iron bars");

    blockVectorOptions.includeLiquidBlocks = true;
    const water = dimension.getBlockFromRay(test.worldLocation(new Location(.5, 2, 1.5)), new Vector(1, 0, 0), blockVectorOptions);
    test.assert(water.type == MinecraftBlockTypes.water, "Expected to see the water");

    test.succeed();
})
    .setupTicks(4) // time for water to convert from dynamic to static type
    .tag(GameTest.Tags.suiteDefault);


GameTest.register("RaycastingTests", "get_entity_from_vector", (test) => {

    let dimension = test.getDimension();

    test.spawnWithoutBehaviors("creeper", new BlockLocation(3, 2, 1))
    test.spawnWithoutBehaviors("creeper", new BlockLocation(2, 2, 1))

    // test both creepers are found
    const creepers = dimension.getEntitiesFromRay(test.worldLocation(new Location(.5, 3.5, 1.5)), new Vector(1, 0, 0), new EntityRaycastOptions());
    test.assert(creepers.length == 2, "Expected to find 2 creepers");
    test.assertEntityInstancePresent(creepers[0], new BlockLocation(2, 2, 1));
    test.assertEntityInstancePresent(creepers[1], new BlockLocation(3, 2, 1));

    // check the entities are sorted by distance
    const creepersReversed = dimension.getEntitiesFromRay(test.worldLocation(new Location(5.5, 2.5, 1.5)), new Vector(-1, 0, 0), new EntityRaycastOptions());
    test.assert(creepersReversed.length == 2, "Expected to find 2 creepers");
    test.assertEntityInstancePresent(creepersReversed[0], new BlockLocation(3, 2, 1));
    test.assertEntityInstancePresent(creepersReversed[1], new BlockLocation(2, 2, 1));

    // test blocks stop the entity raycast
    const blockedCreepers = dimension.getEntitiesFromRay(test.worldLocation(new Location(5.5, 3.5, 1.5)), new Vector(-1, 0, 0), new EntityRaycastOptions());
    test.assert(blockedCreepers.length == 0, "Expected the block to stop the raycast");

    test.succeed();
})
    .setupTicks(4) // time for water to convert from dynamic to static type
    .tag(GameTest.Tags.suiteDefault);

// SIG // Begin signature block
// SIG // MIInxwYJKoZIhvcNAQcCoIInuDCCJ7QCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // 4zbh0+TPJU9+syWdYXTcxDYFABa10iOjbqHlJhV2fZqg
// SIG // gg2BMIIF/zCCA+egAwIBAgITMwAAAlKLM6r4lfM52wAA
// SIG // AAACUjANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTIxMDkwMjE4MzI1OVoX
// SIG // DTIyMDkwMTE4MzI1OVowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // 0OTPj7P1+wTbr+Qf9COrqA8I9DSTqNSq1UKju4IEV3HJ
// SIG // Jck61i+MTEoYyKLtiLG2Jxeu8F81QKuTpuKHvi380gzs
// SIG // 43G+prNNIAaNDkGqsENQYo8iezbw3/NCNX1vTi++irdF
// SIG // qXNs6xoc3B3W+7qT678b0jTVL8St7IMO2E7d9eNdL6RK
// SIG // fMnwRJf4XfGcwL+OwwoCeY9c5tvebNUVWRzaejKIkBVT
// SIG // hApuAMCtpdvIvmBEdSTuCKZUx+OLr81/aEZyR2jL1s2R
// SIG // KaMz8uIzTtgw6m3DbOM4ewFjIRNT1hVQPghyPxJ+ZwEr
// SIG // wry5rkf7fKuG3PF0fECGSUEqftlOptpXTQIDAQABo4IB
// SIG // fjCCAXowHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFDWSWhFBi9hrsLe2TgLuHnxG
// SIG // F3nRMFAGA1UdEQRJMEekRTBDMSkwJwYDVQQLEyBNaWNy
// SIG // b3NvZnQgT3BlcmF0aW9ucyBQdWVydG8gUmljbzEWMBQG
// SIG // A1UEBRMNMjMwMDEyKzQ2NzU5NzAfBgNVHSMEGDAWgBRI
// SIG // bmTlUAXTgqoXNzcitW2oynUClTBUBgNVHR8ETTBLMEmg
// SIG // R6BFhkNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NybC9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3JsMGEGCCsGAQUFBwEBBFUwUzBRBggrBgEFBQcw
// SIG // AoZFaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraW9w
// SIG // cy9jZXJ0cy9NaWNDb2RTaWdQQ0EyMDExXzIwMTEtMDct
// SIG // MDguY3J0MAwGA1UdEwEB/wQCMAAwDQYJKoZIhvcNAQEL
// SIG // BQADggIBABZJN7ksZExAYdTbQJewYryBLAFnYF9amfhH
// SIG // WTGG0CmrGOiIUi10TMRdQdzinUfSv5HHKZLzXBpfA+2M
// SIG // mEuJoQlDAUflS64N3/D1I9/APVeWomNvyaJO1mRTgJoz
// SIG // 0TTRp8noO5dJU4k4RahPtmjrOvoXnoKgHXpRoDSSkRy1
// SIG // kboRiriyMOZZIMfSsvkL2a5/w3YvLkyIFiqfjBhvMWOj
// SIG // wb744LfY0EoZZz62d1GPAb8Muq8p4VwWldFdE0y9IBMe
// SIG // 3ofytaPDImq7urP+xcqji3lEuL0x4fU4AS+Q7cQmLq12
// SIG // 0gVbS9RY+OPjnf+nJgvZpr67Yshu9PWN0Xd2HSY9n9xi
// SIG // au2OynVqtEGIWrSoQXoOH8Y4YNMrrdoOmjNZsYzT6xOP
// SIG // M+h1gjRrvYDCuWbnZXUcOGuOWdOgKJLaH9AqjskxK76t
// SIG // GI6BOF6WtPvO0/z1VFzan+2PqklO/vS7S0LjGEeMN3Ej
// SIG // 47jbrLy3/YAZ3IeUajO5Gg7WFg4C8geNhH7MXjKsClsA
// SIG // Pk1YtB61kan0sdqJWxOeoSXBJDIzkis97EbrqRQl91K6
// SIG // MmH+di/tolU63WvF1nrDxutjJ590/ALi383iRbgG3zkh
// SIG // EceyBWTvdlD6FxNbhIy+bJJdck2QdzLm4DgOBfCqETYb
// SIG // 4hQBEk/pxvHPLiLG2Xm9PEnmEDKo1RJpMIIHejCCBWKg
// SIG // AwIBAgIKYQ6Q0gAAAAAAAzANBgkqhkiG9w0BAQsFADCB
// SIG // iDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0
// SIG // b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1p
// SIG // Y3Jvc29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWlj
// SIG // cm9zb2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5
// SIG // IDIwMTEwHhcNMTEwNzA4MjA1OTA5WhcNMjYwNzA4MjEw
// SIG // OTA5WjB+MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSgwJgYDVQQD
// SIG // Ex9NaWNyb3NvZnQgQ29kZSBTaWduaW5nIFBDQSAyMDEx
// SIG // MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA
// SIG // q/D6chAcLq3YbqqCEE00uvK2WCGfQhsqa+laUKq4Bjga
// SIG // BEm6f8MMHt03a8YS2AvwOMKZBrDIOdUBFDFC04kNeWSH
// SIG // fpRgJGyvnkmc6Whe0t+bU7IKLMOv2akrrnoJr9eWWcpg
// SIG // GgXpZnboMlImEi/nqwhQz7NEt13YxC4Ddato88tt8zpc
// SIG // oRb0RrrgOGSsbmQ1eKagYw8t00CT+OPeBw3VXHmlSSnn
// SIG // Db6gE3e+lD3v++MrWhAfTVYoonpy4BI6t0le2O3tQ5GD
// SIG // 2Xuye4Yb2T6xjF3oiU+EGvKhL1nkkDstrjNYxbc+/jLT
// SIG // swM9sbKvkjh+0p2ALPVOVpEhNSXDOW5kf1O6nA+tGSOE
// SIG // y/S6A4aN91/w0FK/jJSHvMAhdCVfGCi2zCcoOCWYOUo2
// SIG // z3yxkq4cI6epZuxhH2rhKEmdX4jiJV3TIUs+UsS1Vz8k
// SIG // A/DRelsv1SPjcF0PUUZ3s/gA4bysAoJf28AVs70b1FVL
// SIG // 5zmhD+kjSbwYuER8ReTBw3J64HLnJN+/RpnF78IcV9uD
// SIG // jexNSTCnq47f7Fufr/zdsGbiwZeBe+3W7UvnSSmnEyim
// SIG // p31ngOaKYnhfsi+E11ecXL93KCjx7W3DKI8sj0A3T8Hh
// SIG // hUSJxAlMxdSlQy90lfdu+HggWCwTXWCVmj5PM4TasIgX
// SIG // 3p5O9JawvEagbJjS4NaIjAsCAwEAAaOCAe0wggHpMBAG
// SIG // CSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBRIbmTlUAXT
// SIG // gqoXNzcitW2oynUClTAZBgkrBgEEAYI3FAIEDB4KAFMA
// SIG // dQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/BAUw
// SIG // AwEB/zAfBgNVHSMEGDAWgBRyLToCMZBDuRQFTuHqp8cx
// SIG // 0SOJNDBaBgNVHR8EUzBRME+gTaBLhklodHRwOi8vY3Js
// SIG // Lm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0cy9N
// SIG // aWNSb29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3JsMF4G
// SIG // CCsGAQUFBwEBBFIwUDBOBggrBgEFBQcwAoZCaHR0cDov
// SIG // L3d3dy5taWNyb3NvZnQuY29tL3BraS9jZXJ0cy9NaWNS
// SIG // b29DZXJBdXQyMDExXzIwMTFfMDNfMjIuY3J0MIGfBgNV
// SIG // HSAEgZcwgZQwgZEGCSsGAQQBgjcuAzCBgzA/BggrBgEF
// SIG // BQcCARYzaHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3Br
// SIG // aW9wcy9kb2NzL3ByaW1hcnljcHMuaHRtMEAGCCsGAQUF
// SIG // BwICMDQeMiAdAEwAZQBnAGEAbABfAHAAbwBsAGkAYwB5
// SIG // AF8AcwB0AGEAdABlAG0AZQBuAHQALiAdMA0GCSqGSIb3
// SIG // DQEBCwUAA4ICAQBn8oalmOBUeRou09h0ZyKbC5YR4WOS
// SIG // mUKWfdJ5DJDBZV8uLD74w3LRbYP+vj/oCso7v0epo/Np
// SIG // 22O/IjWll11lhJB9i0ZQVdgMknzSGksc8zxCi1LQsP1r
// SIG // 4z4HLimb5j0bpdS1HXeUOeLpZMlEPXh6I/MTfaaQdION
// SIG // 9MsmAkYqwooQu6SpBQyb7Wj6aC6VoCo/KmtYSWMfCWlu
// SIG // WpiW5IP0wI/zRive/DvQvTXvbiWu5a8n7dDd8w6vmSiX
// SIG // mE0OPQvyCInWH8MyGOLwxS3OW560STkKxgrCxq2u5bLZ
// SIG // 2xWIUUVYODJxJxp/sfQn+N4sOiBpmLJZiWhub6e3dMNA
// SIG // BQamASooPoI/E01mC8CzTfXhj38cbxV9Rad25UAqZaPD
// SIG // XVJihsMdYzaXht/a8/jyFqGaJ+HNpZfQ7l1jQeNbB5yH
// SIG // PgZ3BtEGsXUfFL5hYbXw3MYbBL7fQccOKO7eZS/sl/ah
// SIG // XJbYANahRr1Z85elCUtIEJmAH9AAKcWxm6U/RXceNcbS
// SIG // oqKfenoi+kiVH6v7RyOA9Z74v2u3S5fi63V4GuzqN5l5
// SIG // GEv/1rMjaHXmr/r8i+sLgOppO6/8MO0ETI7f33VtY5E9
// SIG // 0Z1WTk+/gFcioXgRMiF670EKsT/7qMykXcGhiJtXcVZO
// SIG // SEXAQsmbdlsKgEhr/Xmfwb1tbWrJUnMTDXpQzTGCGZ4w
// SIG // ghmaAgEBMIGVMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAm
// SIG // BgNVBAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENB
// SIG // IDIwMTECEzMAAAJSizOq+JXzOdsAAAAAAlIwDQYJYIZI
// SIG // AWUDBAIBBQCggcAwGQYJKoZIhvcNAQkDMQwGCisGAQQB
// SIG // gjcCAQQwHAYKKwYBBAGCNwIBCzEOMAwGCisGAQQBgjcC
// SIG // ARUwLwYJKoZIhvcNAQkEMSIEIKxIUfQ2oy4OVjN9o6M/
// SIG // P0U6leSxb18PPu1i+7MzCSggMFQGCisGAQQBgjcCAQwx
// SIG // RjBEoCSAIgBNAGkAbgBlAGMAcgBhAGYAdAAgAEIAZQBk
// SIG // AHIAbwBjAGuhHIAaaHR0cHM6Ly93d3cubWluZWNyYWZ0
// SIG // Lm5ldC8wDQYJKoZIhvcNAQEBBQAEggEAhTWdktC6xf5T
// SIG // huxkAEaOv1bZzE+kCzSDCuqIDKDY7+PGAgs66hai8rfC
// SIG // jVxOrJ2sP3ZbeIofsDqQEswbxOTf5UWpBsExL+JTpD1w
// SIG // dPoAIU8yYsE7cLV/1K9qlorxeJ/B4akX+4QSuCG7+CwW
// SIG // K+jgz8L+2GZ7nRPzEuhmf1BXkhabDz+FD1WzePSZy0B/
// SIG // g49jCle1A/cBCCEDBj14t0vFZGE5Ptw+IBsRWSEeBASJ
// SIG // EQz85YvWa5nKfrL+nm3CvmawteHSFBGSjNTbw4X9dxqr
// SIG // 8B2JPz8+PFqWvTNUehXtC/v9i3Rjj1Qvyc0BXyUAxX64
// SIG // kB2ip2p4I+lR+cyhXsCfYKGCFxYwghcSBgorBgEEAYI3
// SIG // AwMBMYIXAjCCFv4GCSqGSIb3DQEHAqCCFu8wghbrAgED
// SIG // MQ8wDQYJYIZIAWUDBAIBBQAwggFZBgsqhkiG9w0BCRAB
// SIG // BKCCAUgEggFEMIIBQAIBAQYKKwYBBAGEWQoDATAxMA0G
// SIG // CWCGSAFlAwQCAQUABCASsRAUH2fdjO13u9owKC+iOu6w
// SIG // l7scBSLf2oMC/aANjQIGYoZWhMcsGBMyMDIyMDYxNjIz
// SIG // MTYwNC4zMTZaMASAAgH0oIHYpIHVMIHSMQswCQYDVQQG
// SIG // EwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UE
// SIG // BxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENv
// SIG // cnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQgSXJl
// SIG // bGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNVBAsT
// SIG // HVRoYWxlcyBUU1MgRVNOOjNCRDQtNEI4MC02OUMzMSUw
// SIG // IwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBTZXJ2
// SIG // aWNloIIRZTCCBxQwggT8oAMCAQICEzMAAAGJtL+GMIQc
// SIG // S48AAQAAAYkwDQYJKoZIhvcNAQELBQAwfDELMAkGA1UE
// SIG // BhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNV
// SIG // BAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBD
// SIG // b3Jwb3JhdGlvbjEmMCQGA1UEAxMdTWljcm9zb2Z0IFRp
// SIG // bWUtU3RhbXAgUENBIDIwMTAwHhcNMjExMDI4MTkyNzQx
// SIG // WhcNMjMwMTI2MTkyNzQxWjCB0jELMAkGA1UEBhMCVVMx
// SIG // EzARBgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1Jl
// SIG // ZG1vbmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3Jh
// SIG // dGlvbjEtMCsGA1UECxMkTWljcm9zb2Z0IElyZWxhbmQg
// SIG // T3BlcmF0aW9ucyBMaW1pdGVkMSYwJAYDVQQLEx1UaGFs
// SIG // ZXMgVFNTIEVTTjozQkQ0LTRCODAtNjlDMzElMCMGA1UE
// SIG // AxMcTWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZTCC
// SIG // AiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAL0G
// SIG // V8WRZmuqZZrjsrzaVfMTjTsHGKJWRvwY8mVhkpOSThmi
// SIG // 8qyiHeVcVR1h5bJiROEr587HabCplcfKLTjb3iFBb0nH
// SIG // hGafFV5ruZtX7vC+3Pt5cF3Im43HKrRL7ULJaJEFcdK/
// SIG // i+eGm6zQ2q8BRu9yGkYnSEtYvXPrpyfKGMoQ0S6wsrBQ
// SIG // FcckITzWZFiu2fP1RrpGiiwFh1wof/ked4eNoBS/vf5g
// SIG // AC8cwl17qH4vH/1ygpu8TcFXNYTjQgs+qKveALn81TZJ
// SIG // CFuG61EIGKQnCZvVNFzZkL7a6KWA5/VLWPGENDSnp1z7
// SIG // XYCx3UPDZ794oBKyi61iNGuZ+Y43Sn8JPvJr2pKnWZpT
// SIG // rHnjktV7KUDSQCtbmZZQCE3J0GTnDuaH4zkN97o1nJAF
// SIG // 3c/v8d6O5eAFP00jjMxmTMIVHbVcAt3UmyLaUlRYJ4zN
// SIG // gjhCfc4AmnbzoqxgyzeO9Y2SNowpZI7CU3YD5N+N00AO
// SIG // CRb3bP7p2atLi6/p4md1+ODgcdsfoFZZZ9nOFG2Vzbng
// SIG // OMktUyRm2yRSCCwJk1APQLo+XiEhk2zYslse/R5wjk2q
// SIG // 9/UBCqM5uC505g18tPyiPx/52GRirkx33JD9vMEEtOqw
// SIG // /nw0ucS8HETAlvdg5B15rW4RskYpQTi+S8WXpUH8beeM
// SIG // JeFlAtAHQBKJT3pDg8DvAgMBAAGjggE2MIIBMjAdBgNV
// SIG // HQ4EFgQUl28fs0daeCCAHoLgOqxypK35e1AwHwYDVR0j
// SIG // BBgwFoAUn6cVXQBeYl2D9OXSZacbUzUZ6XIwXwYDVR0f
// SIG // BFgwVjBUoFKgUIZOaHR0cDovL3d3dy5taWNyb3NvZnQu
// SIG // Y29tL3BraW9wcy9jcmwvTWljcm9zb2Z0JTIwVGltZS1T
// SIG // dGFtcCUyMFBDQSUyMDIwMTAoMSkuY3JsMGwGCCsGAQUF
// SIG // BwEBBGAwXjBcBggrBgEFBQcwAoZQaHR0cDovL3d3dy5t
// SIG // aWNyb3NvZnQuY29tL3BraW9wcy9jZXJ0cy9NaWNyb3Nv
// SIG // ZnQlMjBUaW1lLVN0YW1wJTIwUENBJTIwMjAxMCgxKS5j
// SIG // cnQwDAYDVR0TAQH/BAIwADATBgNVHSUEDDAKBggrBgEF
// SIG // BQcDCDANBgkqhkiG9w0BAQsFAAOCAgEAjrS3aVlCOCsH
// SIG // yy632iqywfdg6mwLKRljONU2juCZfrB8T6OdtrrtxikA
// SIG // o5pEVq3h7ZX8svZDpOy1msd5N5HvBrX3rX24e6h9C3ld
// SIG // lzloN/QTpx3+pk3GauxWEmWXIdSQ0I3PfPjnZaMPqFoo
// SIG // dA27eAlf3tfWXBPtZ9c81pLJFBHdH+YzyFIrN96fr5GP
// SIG // LM3bgLQnCHDxVISPB2+WpT1ADzIxs8Cm+zSCm53/I/HD
// SIG // 9fALOSL3nJBdKIdXMOt0WP7zyutiw2HaYu1pxtjm754H
// SIG // 1lSrcIsEyOIx49nDvat+xw3vzz5dteoEqVGYdGqduJip
// SIG // jA33CqdTeJhHbMc+KLHjqz2HhbBx1iRSegIr76p+9Ck3
// SIG // iaaea/g8Uqm3kstJsSFDqv5QGlMYDUkFVF9urfK/n3Ip
// SIG // KHyr9t1h67UVd7e61U7AfWM60WoopJs+vCuR1nbfTKlC
// SIG // 8T0D6PqaWdC0apDmnuOuvlCkWNCcVrXazHObx5R2X56o
// SIG // 2sI/0bDNkukOn2vU/Qp2NTc+w2ARt8mScgjxbK4FNObP
// SIG // ZY6n7EqbaRXVIfUeHHvi+9UlgyzNsf9TBSyxwDG17BKf
// SIG // CpaBBrWg1C58bX0trWIX7ihqkV6BHwzwDJyHU70D4dxh
// SIG // 0OEo5JAQERy9DGO+WpYRkyh1owtmi1TqPKGyiAZPIX5x
// SIG // Q1H/xMlcOLkwggdxMIIFWaADAgECAhMzAAAAFcXna54C
// SIG // m0mZAAAAAAAVMA0GCSqGSIb3DQEBCwUAMIGIMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMTIwMAYDVQQDEylNaWNyb3NvZnQg
// SIG // Um9vdCBDZXJ0aWZpY2F0ZSBBdXRob3JpdHkgMjAxMDAe
// SIG // Fw0yMTA5MzAxODIyMjVaFw0zMDA5MzAxODMyMjVaMHwx
// SIG // CzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpXYXNoaW5ndG9u
// SIG // MRAwDgYDVQQHEwdSZWRtb25kMR4wHAYDVQQKExVNaWNy
// SIG // b3NvZnQgQ29ycG9yYXRpb24xJjAkBgNVBAMTHU1pY3Jv
// SIG // c29mdCBUaW1lLVN0YW1wIFBDQSAyMDEwMIICIjANBgkq
// SIG // hkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA5OGmTOe0ciEL
// SIG // eaLL1yR5vQ7VgtP97pwHB9KpbE51yMo1V/YBf2xK4OK9
// SIG // uT4XYDP/XE/HZveVU3Fa4n5KWv64NmeFRiMMtY0Tz3cy
// SIG // wBAY6GB9alKDRLemjkZrBxTzxXb1hlDcwUTIcVxRMTeg
// SIG // Cjhuje3XD9gmU3w5YQJ6xKr9cmmvHaus9ja+NSZk2pg7
// SIG // uhp7M62AW36MEBydUv626GIl3GoPz130/o5Tz9bshVZN
// SIG // 7928jaTjkY+yOSxRnOlwaQ3KNi1wjjHINSi947SHJMPg
// SIG // yY9+tVSP3PoFVZhtaDuaRr3tpK56KTesy+uDRedGbsoy
// SIG // 1cCGMFxPLOJiss254o2I5JasAUq7vnGpF1tnYN74kpEe
// SIG // HT39IM9zfUGaRnXNxF803RKJ1v2lIH1+/NmeRd+2ci/b
// SIG // fV+AutuqfjbsNkz2K26oElHovwUDo9Fzpk03dJQcNIIP
// SIG // 8BDyt0cY7afomXw/TNuvXsLz1dhzPUNOwTM5TI4CvEJo
// SIG // LhDqhFFG4tG9ahhaYQFzymeiXtcodgLiMxhy16cg8ML6
// SIG // EgrXY28MyTZki1ugpoMhXV8wdJGUlNi5UPkLiWHzNgY1
// SIG // GIRH29wb0f2y1BzFa/ZcUlFdEtsluq9QBXpsxREdcu+N
// SIG // +VLEhReTwDwV2xo3xwgVGD94q0W29R6HXtqPnhZyacau
// SIG // e7e3PmriLq0CAwEAAaOCAd0wggHZMBIGCSsGAQQBgjcV
// SIG // AQQFAgMBAAEwIwYJKwYBBAGCNxUCBBYEFCqnUv5kxJq+
// SIG // gpE8RjUpzxD/LwTuMB0GA1UdDgQWBBSfpxVdAF5iXYP0
// SIG // 5dJlpxtTNRnpcjBcBgNVHSAEVTBTMFEGDCsGAQQBgjdM
// SIG // g30BATBBMD8GCCsGAQUFBwIBFjNodHRwOi8vd3d3Lm1p
// SIG // Y3Jvc29mdC5jb20vcGtpb3BzL0RvY3MvUmVwb3NpdG9y
// SIG // eS5odG0wEwYDVR0lBAwwCgYIKwYBBQUHAwgwGQYJKwYB
// SIG // BAGCNxQCBAweCgBTAHUAYgBDAEEwCwYDVR0PBAQDAgGG
// SIG // MA8GA1UdEwEB/wQFMAMBAf8wHwYDVR0jBBgwFoAU1fZW
// SIG // y4/oolxiaNE9lJBb186aGMQwVgYDVR0fBE8wTTBLoEmg
// SIG // R4ZFaHR0cDovL2NybC5taWNyb3NvZnQuY29tL3BraS9j
// SIG // cmwvcHJvZHVjdHMvTWljUm9vQ2VyQXV0XzIwMTAtMDYt
// SIG // MjMuY3JsMFoGCCsGAQUFBwEBBE4wTDBKBggrBgEFBQcw
// SIG // AoY+aHR0cDovL3d3dy5taWNyb3NvZnQuY29tL3BraS9j
// SIG // ZXJ0cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcnQw
// SIG // DQYJKoZIhvcNAQELBQADggIBAJ1VffwqreEsH2cBMSRb
// SIG // 4Z5yS/ypb+pcFLY+TkdkeLEGk5c9MTO1OdfCcTY/2mRs
// SIG // fNB1OW27DzHkwo/7bNGhlBgi7ulmZzpTTd2YurYeeNg2
// SIG // LpypglYAA7AFvonoaeC6Ce5732pvvinLbtg/SHUB2Rje
// SIG // bYIM9W0jVOR4U3UkV7ndn/OOPcbzaN9l9qRWqveVtihV
// SIG // J9AkvUCgvxm2EhIRXT0n4ECWOKz3+SmJw7wXsFSFQrP8
// SIG // DJ6LGYnn8AtqgcKBGUIZUnWKNsIdw2FzLixre24/LAl4
// SIG // FOmRsqlb30mjdAy87JGA0j3mSj5mO0+7hvoyGtmW9I/2
// SIG // kQH2zsZ0/fZMcm8Qq3UwxTSwethQ/gpY3UA8x1RtnWN0
// SIG // SCyxTkctwRQEcb9k+SS+c23Kjgm9swFXSVRk2XPXfx5b
// SIG // RAGOWhmRaw2fpCjcZxkoJLo4S5pu+yFUa2pFEUep8beu
// SIG // yOiJXk+d0tBMdrVXVAmxaQFEfnyhYWxz/gq77EFmPWn9
// SIG // y8FBSX5+k77L+DvktxW/tM4+pTFRhLy/AsGConsXHRWJ
// SIG // jXD+57XQKBqJC4822rpM+Zv/Cuk0+CQ1ZyvgDbjmjJnW
// SIG // 4SLq8CdCPSWU5nR0W2rRnj7tfqAxM328y+l7vzhwRNGQ
// SIG // 8cirOoo6CGJ/2XBjU02N7oJtpQUQwXEGahC0HVUzWLOh
// SIG // cGbyoYIC1DCCAj0CAQEwggEAoYHYpIHVMIHSMQswCQYD
// SIG // VQQGEwJVUzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4G
// SIG // A1UEBxMHUmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0
// SIG // IENvcnBvcmF0aW9uMS0wKwYDVQQLEyRNaWNyb3NvZnQg
// SIG // SXJlbGFuZCBPcGVyYXRpb25zIExpbWl0ZWQxJjAkBgNV
// SIG // BAsTHVRoYWxlcyBUU1MgRVNOOjNCRDQtNEI4MC02OUMz
// SIG // MSUwIwYDVQQDExxNaWNyb3NvZnQgVGltZS1TdGFtcCBT
// SIG // ZXJ2aWNloiMKAQEwBwYFKw4DAhoDFQAhpQmt5Hrcnrns
// SIG // u2yTaVpDLognEKCBgzCBgKR+MHwxCzAJBgNVBAYTAlVT
// SIG // MRMwEQYDVQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdS
// SIG // ZWRtb25kMR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9y
// SIG // YXRpb24xJjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0
// SIG // YW1wIFBDQSAyMDEwMA0GCSqGSIb3DQEBBQUAAgUA5lW9
// SIG // ajAiGA8yMDIyMDYxNjIyMzIxMFoYDzIwMjIwNjE3MjIz
// SIG // MjEwWjB0MDoGCisGAQQBhFkKBAExLDAqMAoCBQDmVb1q
// SIG // AgEAMAcCAQACAgkjMAcCAQACAhFQMAoCBQDmVw7qAgEA
// SIG // MDYGCisGAQQBhFkKBAIxKDAmMAwGCisGAQQBhFkKAwKg
// SIG // CjAIAgEAAgMHoSChCjAIAgEAAgMBhqAwDQYJKoZIhvcN
// SIG // AQEFBQADgYEAMehDEXTrjRcgFT9oYSMmwm+HY11XmWyy
// SIG // gEA57p4TS3V2Zoi7GUmyVIftcjWsP/gV7g1puopZ8cww
// SIG // ZklGBw9gXHJHulCWNm8LpCCumuUU3mMueasB6OC0TP4J
// SIG // sBxJbzca4qiQJOYcyzbT+dckrcRvzWYMOjDgw7tqE8Qh
// SIG // UWZCI5IxggQNMIIECQIBATCBkzB8MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSYwJAYDVQQDEx1NaWNyb3NvZnQgVGltZS1T
// SIG // dGFtcCBQQ0EgMjAxMAITMwAAAYm0v4YwhBxLjwABAAAB
// SIG // iTANBglghkgBZQMEAgEFAKCCAUowGgYJKoZIhvcNAQkD
// SIG // MQ0GCyqGSIb3DQEJEAEEMC8GCSqGSIb3DQEJBDEiBCDD
// SIG // IZUrro2EseYLeSgCrJO6pNvrKRv1AgAsX00Kf9WPiDCB
// SIG // +gYLKoZIhvcNAQkQAi8xgeowgecwgeQwgb0EIGZ3RzHc
// SIG // UFdVbG6Vhzkx6lhMnL3ESZu3GOvZf1Jk/I9FMIGYMIGA
// SIG // pH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hp
// SIG // bmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoT
// SIG // FU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQGA1UEAxMd
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIwMTACEzMA
// SIG // AAGJtL+GMIQcS48AAQAAAYkwIgQgVN32mEAfsvo/K/X2
// SIG // EgAbGRZ7qkuHpNiFS+CcD6cT2NgwDQYJKoZIhvcNAQEL
// SIG // BQAEggIAcvV9PSjmBWycNySJAGztgqGAnWqoCzuHLsTT
// SIG // j7JrFFeU6E860GRylmssly0S60cqpeB3sAfbxB/X+giS
// SIG // akiOueaTUWcA6POmyOWezCWJByIkvzebmiaWNgZuOweC
// SIG // 1iok+otyNsvPiS4koHfS5DaBDC6e9rkG3FKABkKxbS4k
// SIG // qiRcpmu0O0hTLJEjo5WU42zPttIjS8RcLr7f27xGz6VK
// SIG // dlOtQQmFT+SCIBGHoRnk3/v3doWiT0ZeS3xd+GSU+ECT
// SIG // QKRn41UBeZVUkaIPZp40RCpWVafZaw5yCdliARPiLHFo
// SIG // gnSZdW/n8SM81b6DKBy2iTVV5uN4X2B1wO93g6i4VPEY
// SIG // DmF94uUavsssZybeWXolf18ic728dKscqxCNPZtCnm6L
// SIG // SNtH4O9beQoZBSmKffdfXQ7Pkb65f6PdmydU+6fKlJqz
// SIG // A67yCio0hopTa3ECx681IPHMXutIY3x+CGibeNGFkjlh
// SIG // VDSsDiVN98qyl4xqvMEVOZXC8EbWvw18LSEtsAjhJzSu
// SIG // rw3mUtkaj1jpFR67vqlQ0GW91l566hgyIwrCBhguaa3R
// SIG // 3gNPGjqSTc5BNGTFSbB/vUrmYGhbBWSko2NLyKjVDdtA
// SIG // PWo3/Zywc+s8O/ekfXu+tnUb2/ppviWUXY49YeinmfQr
// SIG // 3Q6T6fAiZ4CgF0Sj1S56n+DMqVyG17E=
// SIG // End signature block
