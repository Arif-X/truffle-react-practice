pragma experimental ABIEncoderV2;
pragma solidity ^0.5.0;

contract CRUD{
    uint public count = 0;

    struct MyData {
        uint id;
        string name;
        string addr;
        bool active;
    }

    mapping(uint => MyData) public myData;

    event MyDataCreated(
        uint id,
        string name,
        string addr,
        bool active
    );

    event MyDataUpdated(
        uint id,
        string name,
        string addr
    );

    event MyDataDeleted(
        uint id,
        bool active
    );

    function store(string memory _name, string memory _addr) public {
        count ++;
        myData[count] = MyData(count, _name, _addr, true);
        emit MyDataCreated(count, _name, _addr, true);
    }

    function show(uint _id) external view returns (MyData memory) {
        MyData memory _myData = myData[_id];
        return _myData;
    }

    function update(uint _id, string memory _name, string memory _addr) public {
        MyData memory _myData = myData[_id];
        _myData.name = _name;
        _myData.addr = _addr;
        myData[_id] = _myData;
        emit MyDataUpdated(_id, _name, _addr);
    }

    function destroy(uint _id) public {
        MyData memory _myData = myData[_id];
        _myData.active = false;
        myData[_id] = _myData;
        emit MyDataDeleted(_id, false);
    }
}