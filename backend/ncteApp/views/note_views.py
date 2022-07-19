from ..models import Categories, Notes, Summary
from ml.summary_model import get_summary
from ml.keyword_model import get_keyword
from rest_framework import permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from ..serializers import KeywordSerializer, NoteSerializer, SummarySerializer
from django.db.models import Q, F


class NotesList(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        category_pk = request.GET.get('category')
        if category_pk == 'all':
            queryset = Notes.objects.filter(user_id=pk)
        else:
            category_id = Categories.objects.get(
                category=category_pk)[0]['category_id']
            queryset = Notes.objects.filter(
                user_id=pk, category_id=category_id)
        queryset = queryset.order_by('-date')
        serializer = NoteSerializer(queryset, many=True)
        return Response(Util.response(True, serializer.data, 200), status=status.HTTP_200_OK)


class CreateNote(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            note_id = serializer.data["note_id"]
            contents = serializer.data["contents"]

            # 요약
            summary = get_summary(contents)
            s_serializer = SummarySerializer(
                data={"note_id": note_id, "summary": summary})
            s_check = True
            if s_serializer.is_valid():
                s_serializer.save()
            else:
                s_check = False

            # 키워드
            keywords = get_keyword(contents)
            k_check = True
            for i in range(len(keywords)):
                k_serializer = KeywordSerializer(
                    data={"note_id": note_id, "keyword": keywords[i]})
                if k_serializer.is_valid():
                    k_serializer.save()
                else:
                    k_check = False
            if s_check and k_check:
                return Response(Util.response(True, serializer.data, 201), status=status.HTTP_201_CREATED)
            if not s_check:
                return Response(Util.response(False, s_serializer.errors, 400), status=status.HTTP_400_BAD_REQUEST)
            if not k_check:
                return Response(Util.response(False, k_serializer.errors, 400), status=status.HTTP_400_BAD_REQUEST)
        return Response(Util.response(False, serializer.errors, 400), status=status.HTTP_400_BAD_REQUEST)


class NoteDetail(APIView):
    permission_classes = [permissions.AllowAny]

    def get_object(self, pk):
        try:
            note = Notes.objects.get(pk=pk)
            return note
        except Notes.DoesNotExist:
            return Response(data=Util.response(False, "NOT FOUND", 400), status=status.HTTP_404_NOT_FOUND)

    def get(self, request, pk):
        note = Notes.objects.filter(note_id=pk)
        queryset = note.select_related(
            "category_id").values('category_id__category').prefetch_related("summary_set")
        queryset = queryset.values(category=F(
            'category_id__category'), summary=F('summary__summary'))
        return Response(data=Util.response(True, queryset.values('note_id', 'title', 'contents', 'date', 'summary', 'category'), status.HTTP_200_OK), status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = self.get_object(pk)
        serializer = NoteSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            note_id = serializer.data["note_id"]
            contents = serializer.data["contents"]
            summary = get_summary(contents)
            s = Summary.objects.filter(note_id=note_id).first()
            s_serializer = SummarySerializer(s,
                                             data={"note_id": note_id, "summary": summary})

            if s_serializer.is_valid():
                s_serializer.save()
                return Response(Util.response(True, serializer.data, 200), status=status.HTTP_200_OK)
            return Response(Util.response(False, s_serializer.errors, 400), status=status.HTTP_400_BAD_REQUEST)
        return Response(Util.response(False, serializer.errors, 400), status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        note = Notes.objects.filter(note_id=pk)
        note.delete()
        return Response(Util.response(True, "", 204), status=status.HTTP_204_NO_CONTENT)


class Util():
    def response(success, data, status):
        return {
            "success": success,
            "result": data,
            "status": status
        }
